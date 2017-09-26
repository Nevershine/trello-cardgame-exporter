#!/usr/bin/env node
import {readFileSync} from "fs";

interface TrelloExport {
  cards: any[];
  lists: any[];
}

interface RawCard {
  deck: string;
  description: string;
  name: string;
}

interface WrittenCard {
  description: string;
  name: string;
}

interface List {
  id: string;
  name: string;
}

interface Deck {
  cards: WrittenCard[];
  name: string;
}

interface DeckMap {
  [index: string]: Deck;
}

const inputFile: string = process.argv[2];

if (!inputFile) {
  process.stderr.write("No input file specified.");
  process.exit(0);
}

const rawInput = readFileSync(inputFile, "utf8");
let input: TrelloExport;

try {
  input = JSON.parse(rawInput);
} catch (error) {
  process.stderr.write(`Could not parse input JSON: ${error.message}`);
  process.exit(0);
}

function createCard(cardData: any): RawCard {
  return {
    deck: cardData.idList,
    description: cardData.desc,
    name: cardData.name,
  };
}

function createList(listData: any): List {
  return {
    id: listData.id,
    name: listData.name,
  };
}

function createDecks(cards: RawCard[], lists: List[]): Deck[] {
  const decks: DeckMap = {};

  lists.forEach((list: List) => {
    decks[list.id] = {
      cards: [],
      name: list.name,
    };
  });

  cards.forEach((card: RawCard) => {
    const writtenCard: WrittenCard = {
      description: card.description,
      name: card.name,
    };
    decks[card.deck].cards = decks[card.deck].cards.concat(writtenCard);
  });

  return lists.map((list: List) => {
    return decks[list.id];
  });

}

const cardList: RawCard[] = input.cards.map((card: any) => {
  return createCard(card);
});

const listList: List[] = input.lists.map((list: any) => {
  return createList(list);
});

process.stdout.write(JSON.stringify(createDecks(cardList, listList)));

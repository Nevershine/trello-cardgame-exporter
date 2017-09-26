#!/usr/bin/env node
import {readFileSync} from "fs";

interface ITrelloExport {
  cards: any[];
  lists: any[];
}

interface IRawCard {
  name: string;
  description: string;
  deck: string;
}

interface IWrittenCard {
  name: string;
  description: string;
}

interface IList {
  name: string;
  id: string;
}

interface IDeck {
  name: string;
  cards: IWrittenCard[]
}

interface IDeckMap {
  [index: string]: IDeck;
}

const inputFile: string = process.argv[2];

if (!inputFile) {
  process.stderr.write("No input file specified.");
  process.exit(0);
}

const rawInput = readFileSync(inputFile, "utf8");
let input: ITrelloExport;

try {
  input = JSON.parse(rawInput);
} catch (error) {
  process.stderr.write(`Could not parse input JSON: ${error.message}`);
  process.exit(0);
}

function createCard(cardData: any): IRawCard {
  return {
    name: cardData.name,
    description: cardData.desc,
    deck: cardData.idList
  }
}

function createList(listData: any): IList {
  return {
    name: listData.name,
    id: listData.id
  }
}

function createDecks(cards: IRawCard[], lists: IList[]): IDeck[] {
  let decks: IDeckMap = {};

  lists.forEach((list: IList) => {
    decks[list.id] = {
      name: list.name,
      cards: []
    };
  });

  cards.forEach((card: IRawCard) => {
    const writtenCard: IWrittenCard = {
      name: card.name,
      description: card.description
    };
    decks[card.deck].cards = decks[card.deck].cards.concat(writtenCard);
  });

  return lists.map((list: IList) => {
    return decks[list.id];
  });

}

const cardList: IRawCard[] = input.cards.map((card: any) => {
  return createCard(card);
});

const listList: IList[] = input.lists.map((list: any) => {
  return createList(list);
});

process.stdout.write(JSON.stringify(createDecks(cardList, listList)));

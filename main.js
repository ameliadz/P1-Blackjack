const table = document.querySelector('.game-table');
const dealerCards = document.querySelector('.dealer-cards');
const dealerImg = document.querySelector('#dealer');
const playerCards = document.querySelector('.player-cards');
const playerImg = document.querySelector('#player');
const dealBtn = document.querySelector('#deal');
const hitBtn = document.querySelector('#hit');
const standBtn = document.querySelector('#stand');
const pScoreDisplay = document.querySelector('.player-score');
const dScoreDisplay = document.querySelector('.dealer-score');

let dealerHand = [];
let playerHand = [];
let dealerScore = 0;
let playerScore = 0;

const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
const suits = ['C', 'D', 'H', 'S'];
let deck = [];

const cardToRank = card => {
  if (card.isFaceCard()) {
    card.value = 10;
  } else if (card.value === 'A') {
    card.value = 11;
  }
}

class Card {
  constructor(num, suit, value, pic) {
    this.num = num;
    this.suit = suit;
    this.value = value;
    this.pic = `images/${pic}.png`;
    this.back = `images/gray_back.png`;
  }
  isFaceCard() {
    if (this.value === 'J' || this.value === 'Q' || this.value === 'K') {
      return true;
    }
  }
}

const buildDeck = () => {
  for (let x = 0; x < 8; x++) {
    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < values.length; j++) {
        let card = new Card(values[j], suits[i], values[j], values[j] + suits[i]);
        deck.push(card);
      }
    }
    deck.forEach(cardToRank);
  }
  return deck;
}

buildDeck();

const display = (hand, div) => {
  div.innerHTML = null;
  for (let i = 0; i < hand.length; i++) {
    let img = document.createElement('img');
    if (hand === dealerHand && i === 0) {
      img.src = `${hand[i].back}`;
      img.alt = `Card back`;
    } else {
      img.src = `${hand[i].pic}`;
      img.alt = `${hand[i].num} of ${hand[i].suit}`;
    }
    div.appendChild(img);
  }
}

const getScore = (hand, score) => {
  for (let i = 0; i < hand.length; i++) {
    score += hand[i].value;
    if (score > 21) {
      if (hand[i].value === 11) {
        score = 0;
        hand[i].value = 1;
        getScore(hand, score);
      //  console.log(score + ' ' +  hand[i].value + ` i'm an ace`);
      }
    }
  }
  return score;
}

const showScore = (hand, score, p) => {
  p.textContent = `${getScore(hand, score)}`;
}

const deal = () => {
  dealerHand = [];
  playerHand = [];
  dealerCard1 = deck[Math.floor(Math.random() * deck.length)];
  deck.splice(deck.indexOf(dealerCard1), 1);
  dealerCard2 = deck[Math.floor(Math.random() * deck.length)];
  deck.splice(deck.indexOf(dealerCard2), 1);
  dealerHand.push(dealerCard1, dealerCard2);
  playerCard1 = deck[Math.floor(Math.random() * deck.length)];
  deck.splice(deck.indexOf(playerCard1), 1);
  playerCard2 = deck[Math.floor(Math.random() * deck.length)];
  deck.splice(deck.indexOf(playerCard2), 1);
  playerHand.push(playerCard1, playerCard2);

  display(dealerHand, dealerCards);
  display(playerHand, playerCards);

  dScoreDisplay.textContent = '';
  showScore(playerHand, playerScore, pScoreDisplay);

  hitBtn.classList.remove('hidden');
  standBtn.classList.remove('hidden');
  dealBtn.disabled = true;

  return deck;
};


const checkWinner = () => {
  showScore(playerHand, playerScore, pScoreDisplay);
  showScore(dealerHand, dealerScore, dScoreDisplay);
  dealerCards.firstChild.src = dealerHand[0].pic;
  playerScore = getScore(playerHand, playerScore, pScoreDisplay);
  dealerScore = getScore(dealerHand, dealerScore, dScoreDisplay);
  if (playerScore > 21) {
    console.log(`The house wins.`);
  } else {
    if (dealerScore > 21) {
      console.log(`Player wins.`);
    } else {
      if (playerScore === dealerScore) {
        console.log(`Push!`);
      } else if (playerScore > dealerScore) {
        console.log(`Player wins.`);
      } else {
        console.log(`The house wins.`);
      }
    }
  }
  playerHand.forEach(item => {
    console.log(`${item.pic}, ${item.value}, player`);
  });
  dealerHand.forEach(item => {
    console.log(`${item.pic}, ${item.value}, dealer`);
  })

  playerScore = 0;
  dealerScore = 0;
  hitBtn.classList.add('hidden');
  standBtn.classList.add('hidden');
  dealBtn.disabled = false;
}

const hit = (hand, div) => {
    let newCard = deck[Math.floor(Math.random() * deck.length)];
    deck.splice(deck.indexOf(newCard), 1);
    hand.push(newCard);
    display(hand, div);
};

const hitPlayer= () => {
  while (getScore(playerHand, playerScore) <= 21) {
    if (playerHand.length < 5) {
      hit (playerHand, playerCards);
    }
    break;
  }
  if (getScore(playerHand, playerScore) > 21) {
    checkWinner();
  }
  showScore(playerHand, playerScore, pScoreDisplay);
}

const hitDealer = () => {
  while (getScore(dealerHand, dealerScore) <= 17) {
    while (dealerHand.length < 5) {
      hit(dealerHand, dealerCards);
      break;
    }
  }
  checkWinner();
}

dealBtn.addEventListener('click', deal);
hitBtn.addEventListener('click', hitPlayer);
stand.addEventListener('click', hitDealer);

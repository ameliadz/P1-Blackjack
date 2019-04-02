//grabbing DOM elements
const table = document.querySelector('.game-table');
const dealerCards = document.querySelector('.dealer-cards');
const playerCards = document.querySelector('.player-cards');
//const dealBtn = document.querySelector('#deal');
const hitBtn = document.querySelector('#hit');
const standBtn = document.querySelector('#stand');
const pScoreDisplay = document.querySelector('.player-score');
const dScoreDisplay = document.querySelector('.dealer-score');
const potDisplay = document.querySelector('.pot');
const betAmtDisplay = document.querySelector('.bet-amt');
const betBtn = document.querySelector('#bet');
const betNums = document.querySelectorAll('.bet-num');
const clearBtn = document.querySelector('#clear');
const insuranceBtn = document.querySelector('#insurance');
const splitBtn = document.querySelector('#split');
const doubleBtn = document.querySelector('#double');
const insuranceDisplay = document.querySelector('.insurance');


//setting up variables
let dealerHand = [];
let playerHand = [];
let dealerBlackjack = null;
let dealerScore = 0;
let playerScore = 0;
let pot = 100;
let totalBet = 0;
let insuranceBet = 0;
const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace'];
const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
let deck = [];

// display pot size
potDisplay.textContent = `Pot: $${pot}`;

//begin card setup
const cardToRank = card => {
  if (card.isFaceCard()) {
    card.value = 10;
  } else if (card.value === 'Ace') {
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
    if (this.value === 'Jack' || this.value === 'Queen' || this.value === 'King') {
      return true;
    }
  }
}

const buildDeck = () => {
  deck = [];
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


//begin putting the card in the DOM
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

const valueAces = (hand, score) => {
  for (let i = 0; i < hand.length; i++) {
    if (hand[i].value === 11 && score > 21) {
      hand[i].value = 1;
      score = 0;
      for (let j = 0; j < hand.length; j++) {
        score += hand[j].value;
      };
    };
  };
  return score;
}

const getScore = (hand, score) => {
  for (let i = 0; i < hand.length; i++) {
    score += hand[i].value;
    if (score > 21) {
      score = valueAces(hand, score);
    }
  }
  return score;
}

const showScore = (hand, score, p) => {
  p.textContent = `${getScore(hand, score)}`;
}


//placeholder functions/buttons for later features
const offerInsurance = () => {
  if (dealerHand[1].num === 'Ace') {
    insuranceBtn.classList.remove('hidden');
    insuranceBtn.disabled = false;
  };
}

const offerSplit = () => {
  if (playerHand[0].num === playerHand[1].num) {
    splitBtn.classList.remove('hidden');
    splitBtn.disabled = false;
  };
};

const offerDouble = () => {
  doubleBtn.classList.remove('hidden');
  doubleBtn.disabled = false;
}

//deal
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

  if ((playerHand[0].value === 10 && playerHand[1].value === 11) || (playerHand[0].value === 11 && playerHand[1].value === 10)) {
    console.log(`Blackjack!`)
    payout('blackjack');
  };

  offerInsurance();
  offerSplit();
  offerDouble();
  dScoreDisplay.textContent = '';
  showScore(playerHand, playerScore, pScoreDisplay);

  hitBtn.classList.remove('hidden');
  standBtn.classList.remove('hidden');
  //dealBtn.disabled = true;

  return deck;
};

//setting up win evaluation and payout
const payout = condition => {
  switch (condition) {
    case 'insurance':
      pot += 2 * insuranceBet;
      potDisplay.textContent = `Pot: $${pot}`;
      insuranceDisplay.textContent = '';
    case 'loss':
      potDisplay.textContent = `Pot: $${pot}`;
      console.log(pot);
      break;
    case 'win':
      pot += 2 * totalBet;
      potDisplay.textContent = `Pot: $${pot}`;
      console.log(pot);
      break;
    case 'tie':
      pot += totalBet;
      potDisplay.textContent = `Pot: $${pot}`;
      console.log(pot);
      break;
      // double check this tie payout. it might be paying out double.
  }
}

const checkWinner = () => {
  showScore(playerHand, playerScore, pScoreDisplay);
  showScore(dealerHand, dealerScore, dScoreDisplay);
  dealerCards.firstChild.src = dealerHand[0].pic;
  playerScore = getScore(playerHand, playerScore, pScoreDisplay);
  dealerScore = getScore(dealerHand, dealerScore, dScoreDisplay);
  // add blackjack wins and natural 21
  if (playerScore > 21) {
    console.log(`The house wins.`);
    payout('loss');
    console.log(`score > 21`);
  } else {
    if (dealerScore > 21) {
      console.log(`Player wins.`);
      payout('win');
      console.log(`dealer > 21`);
    } else {
      if (playerScore === dealerScore) {
        console.log(`Push!`);
        payout('tie');
        console.log(`tie`);
      } else if (playerScore > dealerScore) {
        console.log(`Player wins.`);
        payout('win');
        console.log(`player > dealer`);
      } else {
        console.log(`The house wins.`);
        payout('loss');
        console.log(`dealer > player`);
      }
    }
  }
  if (dealerBlackjack) {
    console.log(`insurance`);
    payout('insurance');
  };
  playerScore = 0;
  dealerScore = 0;
  totalBet = 0;
  betAmtDisplay.textContent = `bet $${totalBet}`;
  hitBtn.classList.add('hidden');
  standBtn.classList.add('hidden');
  clearBtn.disabled = false;
  //dealBtn.disabled = false;
}


//gameplay: hit or stand
const hit = (hand, div) => {
    let newCard = deck[Math.floor(Math.random() * deck.length)];
    deck.splice(deck.indexOf(newCard), 1);
    hand.push(newCard);
    display(hand, div);
    doubleBtn.classList.add('hidden');
    insuranceBtn.classList.add('hidden');
    splitBtn.classList.add('hidden');
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
  while (getScore(dealerHand, dealerScore) < 17) {
    while (dealerHand.length < 5) {
      hit(dealerHand, dealerCards);
      break;
    }
  }
  insuranceBtn.classList.add('hidden');
  splitBtn.classList.add('hidden');
  doubleBtn.classList.add('hidden');
  checkWinner();
}

//dealBtn.addEventListener('click', deal);
hitBtn.addEventListener('click', hitPlayer);
stand.addEventListener('click', hitDealer);


//gameplay: betting
const bet = (e) => {
  let amtBet = Number(e.target.dataset.amt);
  totalBet += amtBet;
  betAmtDisplay.textContent = `bet $${totalBet}`;
  pot -= totalBet;
  potDisplay.textContent = `Pot: $${pot}`;
  if (!totalBet > 0) {
    betBtn.disabled = true;
  } else {
    betBtn.disabled = false;
    clearBtn.disabled = false;
  }
}

const setBet = () => {
  if (totalBet > 0) {
    //dealBtn.disabled = false;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    deal();
  } else if (totalBet === 0) {
    window.alert(`You must place a bet.`);
  }
  clearBtn.disabled = true;
}

const clearBet = () => {
  totalBet = 0;
  betAmtDisplay.textContent = `bet $${totalBet}`;
  clearBtn.disabled = true;
}

betBtn.addEventListener('click', setBet);
clearBtn.addEventListener('click', clearBet);

betNums.forEach(button => {
  button.addEventListener('click', bet);
});

const insurance = () => {
  insuranceBet = totalBet / 2;
  pot -= insuranceBet;
  if (String(insuranceBet).includes('.')) {
    insuranceDisplay.textContent = `Insurance: $${insuranceBet}0`;
    potDisplay.textContent = `Pot: $${pot}0`;
  } else {
    insuranceDisplay.textContent = `Insurance: $${insuranceBet} `;
    potDisplay.textContent = `Pot: $${pot}`;
  }
  if (dealerHand.length === 2 && ((dealerHand[0].value === 10 && dealerHand[1].value === 11) || (dealerHand[0].value === 11 && dealerHand[1].value === 10))) {
    dealerBlackjack = true;
  }
  insuranceBtn.classList.add('hidden');
}

const doubleDown = () => {
  pot -= totalBet;
  totalBet = totalBet * 2;
  potDisplay.textContent = `Pot: $${pot}`;
  betAmtDisplay.textContent = `bet $${totalBet}`;
  doubleBtn.classList.add('hidden');
  hit(playerHand, playerCards);
  checkWinner();
}

insuranceBtn.addEventListener('click', insurance);
doubleBtn.addEventListener('click', doubleDown);


//placeholder for later features
splitBtn.addEventListener('click', function() {
  splitBtn.classList.add('hidden');
});

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


//setting up variables
let dealerHand = [];
let playerHand = [];
let dealerScore = 0;
let playerScore = 0;
let pot = 100;
let totalBet = 0;
const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
const suits = ['C', 'D', 'H', 'S'];
let deck = [];

// display pot size
potDisplay.textContent = `Pot: $${pot}`;

//begin card setup
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

const getScore = (hand, score) => {
  for (let i = 0; i < hand.length; i++) {
    score += hand[i].value;
    if (score > 21) {
      if (hand[i].value === 11) {
        score = 0;
        hand[i].value = 1;
        getScore(hand, score);
        // does not retroactively change Ace if it would be changed with a different draw order though. e.g., 4, 2, A, K counts as 27 when i think it should probably switch to 17 but maybe i should check with nana.
      }
    }
  }
  return score;
}

const showScore = (hand, score, p) => {
  p.textContent = `${getScore(hand, score)}`;
}


//placeholder functions/buttons for later features
const offerInsurance = () => {
  if (dealerHand[1].num === 'A') {
    insuranceBtn.classList.remove('hidden');
  };
}

const offerSplit = () => {
  if (playerHand[0].num === playerHand[1].num) {
    splitBtn.classList.remove('hidden');
  };
}

const offerDouble = () => {
  doubleBtn.classList.remove('hidden');
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
    case 'loss':
      //pot += totalBet;
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
  playerScore = 0;
  dealerScore = 0;
  hitBtn.classList.add('hidden');
  standBtn.classList.add('hidden');
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
  while (getScore(dealerHand, dealerScore) <= 17) {
    while (dealerHand.length < 5) {
      hit(dealerHand, dealerCards);
      break;
    }
  }
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
  if (!totalBet > 0) {
    betBtn.disabled = true;
  } else {
    betBtn.disabled = false;
    clearBtn.disabled = false;
  }
}

const confirmBet = () => {
  pot -= totalBet;
  potDisplay.textContent = `Pot: $${pot}`;
  if (totalBet > 0) {
    //dealBtn.disabled = false;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    deal();
  }
  clearBtn.disabled = true;
}

const clearBet = () => {
  pot += totalBet;
  totalBet = 0;
  betAmtDisplay.textContent = `bet $${totalBet}`;
  clearBtn.disabled = true;
  // needs a bit of debugging too. if bet is cleared, sometimes bet will add the cleared amt to the pot.
  // also clearBet should be reactivated after a payout
}

betBtn.addEventListener('click', confirmBet);
clearBtn.addEventListener('click', clearBet);

betNums.forEach(square => {
  square.addEventListener('click', bet);
});



//placeholder functions for later features
insuranceBtn.addEventListener('click', function() {
  insuranceBtn.classList.add('hidden');
});

splitBtn.addEventListener('click', function() {
  splitBtn.classList.add('hidden');
});

doubleBtn.addEventListener('click', function() {
  doubleBtn.classList.add('hidden');
})

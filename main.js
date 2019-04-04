// ################# grabbing DOM elements #############
const dealerCards = document.querySelector('.dealer-cards');
const playerCards = document.querySelector('.player-cards');
const hitBtn = document.querySelector('#hit');
const standBtn = document.querySelector('#stand');
const dScoreDisplay = document.querySelector('.dealer-score');
const pScoreDisplay = document.querySelector('.player-score');
const outcome = document.querySelector('.outcome');
const potDisplay = document.querySelector('.pot');
const betAmtDisplay = document.querySelector('.bet-amt');
const betBtn = document.querySelector('#bet');
const betNums = document.querySelectorAll('.bet-num');
const clearBtn = document.querySelector('#clear');
const cashOutBtn = document.querySelector('#cash-out');
const cashOutDisplay = document.querySelector('.cash-out');
const insuranceBtn = document.querySelector('#insurance');
const splitBtn = document.querySelector('#split');
const doubleBtn = document.querySelector('#double');
const insuranceDisplay = document.querySelector('.insurance');
const extraBets = document.querySelectorAll('.extra');
const modal = document.querySelector('.modal-bg');
const closeBtn = document.querySelector('#close');


// ############### setting up variables #################
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

// ############### begin card setup ################
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

const cardToRank = card => {
  if (card.isFaceCard()) {
    card.value = 10;
  } else if (card.value === 'Ace') {
    card.value = 11;
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
  // i found the shuffle function online: this is the Fisher-Yates Shuffle algorithm, it's on wikipedia so it seems like A Legit Thing, and i needed help figuring out how to shuffle an array without getting duplicate elements in my shuffled version.
  const shuffle = (arr) => {
    let currentIndex = arr.length;
    let temporaryValue;
    let randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temporaryValue;
    }
    return arr;
  }
  deck = shuffle(deck);
  return deck;
}

buildDeck();


// ############ begin putting the card in the DOM ###########
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
    img.classList.add('card');
    div.appendChild(img);
  }
}


// ################### scoring hands #################
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


// ############ display pot size #############
const showPot = () => {
  if (String(pot).includes('.')) {
    potDisplay.textContent = `Pot: $${pot}0`;
  } else {
    potDisplay.textContent = `Pot: $${pot}`;
  }
};
showPot();

betAmtDisplay.textContent = `Bet: $${totalBet}`;


//placeholder functions/buttons for later features
const offerInsurance = () => {
  if (dealerHand[1].num === 'Ace' && pot >= (totalBet / 2)) {
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
  if (pot >= totalBet) {
    doubleBtn.classList.remove('hidden');
    doubleBtn.disabled = false;
  };
}


//############# check blackjack ###############
const checkBlackjack = () => {
  if ((playerHand[0].value === 10 && playerHand[1].value === 11) || (playerHand[0].value === 11 && playerHand[1].value === 10)) {
    outcome.textContent = `Blackjack!`;
    console.log('blackjack');
    payout('blackjack');
  };
}
const flash = () => {
  if (outcome.textContent === `Blackjack!`) {
    outcome.classList.add('flash');
  } else {
    outcome.classList.remove('flash');
  };
}


// ###################### deal #######################
const deal = () => {
  dealerHand = [];
  playerHand = [];

  const pickCard = (hand) => {
    let card = deck[0];
    deck.splice(0, 1);
    hand.push(card);
  }

  pickCard(dealerHand);
  pickCard(dealerHand);
  pickCard(playerHand);
  pickCard(playerHand);

  display(dealerHand, dealerCards);
  display(playerHand, playerCards);

  offerInsurance();
  offerSplit();
  offerDouble();
  dScoreDisplay.textContent = '';
  showScore(playerHand, playerScore, pScoreDisplay);

  hitBtn.classList.remove('hidden');
  standBtn.classList.remove('hidden');

  checkBlackjack();

  return deck;
};

const gameReset = () => {
  playerScore = 0;
  dealerScore = 0;
  totalBet = 0;
  insuranceBet = 0;
  betAmtDisplay.textContent = `Bet: $${totalBet}`;
  insuranceDisplay.textContent = '';
  showPot();
  hitBtn.classList.add('hidden');
  standBtn.classList.add('hidden');
  extraBets.forEach(button => {
    button.classList.add('hidden');
  })
  clearBtn.disabled = true;
  betBtn.disabled = false;
  betNums.forEach(button => {
    button.disabled = false;
  });
};

// ######### setting up win evaluation and payout ########
const payout = condition => {
  switch (condition) {
    case 'insurance':
      pot += 3 * insuranceBet;
      showPot();
      insuranceDisplay.textContent = '';
    case 'loss':
      showPot();
      console.log(pot);
      break;
    case 'win':
      pot += 2 * totalBet;
      showPot();
      console.log(pot);
      break;
    case 'tie':
      pot += totalBet;
      showPot();
      console.log(pot);
      break;
    case 'blackjack':
      pot += 2.5 * totalBet;
      showPot();
      console.log(pot);
      break;
  }
  flash();
  gameReset();
}

const checkWinner = () => {
  showScore(playerHand, playerScore, pScoreDisplay);
  showScore(dealerHand, dealerScore, dScoreDisplay);
  dealerCards.firstChild.src = dealerHand[0].pic;
  playerScore = getScore(playerHand, playerScore, pScoreDisplay);
  dealerScore = getScore(dealerHand, dealerScore, dScoreDisplay);
  if (playerScore > 21) {
    outcome.textContent = `Bust! The house wins.`;
    payout('loss');
    console.log(`score > 21`);
  } else {
    if (dealerScore > 21) {
      outcome.textContent = `Dealer bust! Player wins.`;
      payout('win');
      console.log(`dealer > 21`);
    } else {
      if (playerScore === dealerScore) {
        outcome.textContent = `Push!`;
        payout('tie');
        console.log(`tie`);
      } else if (playerScore > dealerScore) {
        outcome.textContent = `Player wins!`;
        payout('win');
        console.log(`player > dealer`);
      } else {
        outcome.textContent = `The house wins.`;
        payout('loss');
        console.log(`dealer > player`);
      }
    }
  }
  if (dealerBlackjack) {
    // console.log('insurance');
    payout('insurance');
  // } else {
  //   console.log(`no insurance`);
  }
}


// ############## gameplay: hit or stand ###########
const hit = (hand, div) => {
    let newCard = deck[Math.floor(Math.random() * deck.length)];
    deck.splice(deck.indexOf(newCard), 1);
    hand.push(newCard);
    display(hand, div);
    extraBets.forEach(button => {
      button.classList.add('hidden');
    })
};

const hitPlayer= () => {
  while (getScore(playerHand, playerScore) < 21) {
    hit (playerHand, playerCards);
    break;
  }
  if (getScore(playerHand, playerScore) >= 21) {
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
  extraBets.forEach(button => {
    button.classList.add('hidden');
  })
  checkWinner();
}

hitBtn.addEventListener('click', hitPlayer);
stand.addEventListener('click', hitDealer);


// ############# gameplay: betting ###############
const bet = (e) => {
  let amtBet = Number(e.target.dataset.amt);
  if (pot >= amtBet) {
    totalBet += amtBet;
    pot -= amtBet;
    betAmtDisplay.textContent = `Bet: $${totalBet}`;
    showPot();
  }
  if (!totalBet > 0) {
    betBtn.disabled = true;
  } else {
    betBtn.disabled = false;
    clearBtn.disabled = false;
  }
}

const setBet = () => {
  if (totalBet > 0) {
    hitBtn.disabled = false;
    standBtn.disabled = false;
    clearBtn.disabled = true;
    betBtn.disabled = true;
    betNums.forEach(button => {
      button.disabled = true;
    });
    outcome.textContent = '';
    deal();
  } else if (totalBet === 0) {
    window.alert(`You must place a bet.`);
  }
}

const clearBet = () => {
  pot += totalBet;
  totalBet = 0;
  showPot();
  betAmtDisplay.textContent = `Bet: $${totalBet}`;
  clearBtn.disabled = true;
}

betBtn.addEventListener('click', setBet);
clearBtn.addEventListener('click', clearBet);

betNums.forEach(button => {
  button.addEventListener('click', bet);
});


const cashOut = () => {
  if (pot > 100) {
    cashOutDisplay.textContent = `You made $${pot - 100}!`;
  } else if (pot < 100) {
    cashOutDisplay.textContent = `You lost $${100 - pot}.`;
  } else {
    cashOutDisplay.textContent = `You broke even!`;
  }
  modal.style.display = 'block';
}
cashOutBtn.addEventListener('click', cashOut);
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  pot = 100;
  showPot();
  gameReset();
  buildDeck();
  // returns undefined instead of dealing if the deck runs out... fix this.
})

// ############## extra bets ##################
const insurance = () => {
  insuranceBet = totalBet / 2;
  pot -= insuranceBet;
  if (String(insuranceBet).includes('.')) {
    insuranceDisplay.textContent = `Insurance: $${insuranceBet}0`;
  } else {
    insuranceDisplay.textContent = `Insurance: $${insuranceBet} `;
  }
  showPot();
  if (dealerHand.length === 2 && ((dealerHand[0].value === 10 && dealerHand[1].value === 11) || (dealerHand[0].value === 11 && dealerHand[1].value === 10))) {
    dealerBlackjack = true;
  }
  insuranceBtn.classList.add('hidden');
  return dealerBlackjack;
}

const doubleDown = () => {
  pot -= totalBet;
  totalBet = totalBet * 2;
  showPot();
  betAmtDisplay.textContent = `Bet: $${totalBet}`;
  doubleBtn.classList.add('hidden');
  hit(playerHand, playerCards);
  if (getScore(playerHand, playerScore) > 21) {
    checkWinner();
  } else {
    hitDealer();
  }
}

insuranceBtn.addEventListener('click', insurance);
doubleBtn.addEventListener('click', doubleDown);


// ######## placeholder for later features ########
splitBtn.addEventListener('click', function() {
  splitBtn.classList.add('hidden');
});

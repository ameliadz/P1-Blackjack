// ################### grabbing DOM elements ####################
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

const clearBtn = document.querySelector('#clear');

const cashOutBtn = document.querySelector('#cash-out');
const cashOutDisplay = document.querySelector('.cash-out');

const insuranceBtn = document.querySelector('#insurance');
const splitBtn = document.querySelector('#split');
const doubleBtn = document.querySelector('#double');

const handCountDisplay = document.querySelector('.hand-count');
const insuranceDisplay = document.querySelector('.insurance');

const extraBets = document.querySelectorAll('.extra');

const cashOutModal = document.querySelector('.cash-modal');
const howModal = document.querySelector('.how-modal');
const howToBtn = document.querySelector('#how-to');
const closeBtn = document.querySelector('#close');
const closeBtn2 = document.querySelector('#close2');

// ################### building bet amount buttons #####################
const makeBetBtns = (id, dataAmt) => {
  let btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('id', id);
  btn.classList.add('bet-num');
  btn.setAttribute('data-amt', dataAmt);
  let bet = document.querySelector('.bet');
  bet.insertBefore(btn, bet.firstElementChild);
}

makeBetBtns('hundred', 100);
makeBetBtns('fifty', 50);
makeBetBtns('twentyfive', 25);
makeBetBtns('ten', 10);
makeBetBtns('five', 5);
makeBetBtns('one', 1);

const betNums = document.querySelectorAll('.bet-num');


// ################## instructions modal #################
howToBtn.addEventListener('click', () => {
  howModal.style.display = 'block';
})
closeBtn2.addEventListener('click', () => {
  howModal.style.display = 'none';
})

// ######################## setting up variables #######################
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
let roundsPlayed = 0;
let hands = [];
let shuffleNext = false;

// ####################### begin card setup #######################
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
  // found the shuffle function online: this is the Fisher-Yates Shuffle algorithm, it's on wikipedia so it seems like A Legit Thing, and i needed help figuring out how to shuffle an array without getting duplicate elements in my shuffled version.
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
  shuffleNext = false;
  return deck;
}

buildDeck();


// ################# begin putting the card in the DOM ################
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


// ######################## scoring hands ###########################
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
  score = 0;
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


// ##################### display pot size #########################
const showPot = () => {
  if (String(pot).includes('.')) {
    potDisplay.textContent = `Pot: $${pot}0`;
  } else {
    potDisplay.textContent = `Pot: $${pot}`;
  }
};
showPot();

betAmtDisplay.textContent = `Bet: $${totalBet}`;


// ############### conditionally offered extra bets ###############
const offerInsurance = () => {
  if (dealerHand[1].num === 'Ace' && pot >= (totalBet / 2)) {
    insuranceBtn.classList.remove('hidden');
    insuranceBtn.disabled = false;
  };
}

const offerDouble = () => {
  if (pot >= totalBet) {
    doubleBtn.classList.remove('hidden');
    doubleBtn.disabled = false;
  };
}

// ##### placeholder for later feature #######
const offerSplit = () => {
  if (pot >= totalBet && playerHand[0].num === playerHand[1].num) {
    splitBtn.classList.remove('hidden');
    splitBtn.disabled = false;
  };
};


//################### check blackjack #####################
const checkBlackjack = () => {
  if ((playerHand[0].value === 10 && playerHand[1].value === 11) || (playerHand[0].value === 11 && playerHand[1].value === 10)) {
    showScore(dealerHand, dealerScore, dScoreDisplay);
    dealerCards.firstChild.src = dealerHand[0].pic;
    if ((dealerHand[0].value === 10 && dealerHand[1].value === 11) || (dealerHand[0].value === 11 && dealerHand[1].value === 10)) {
      payout('tie');
    } else {
      outcome.textContent = `Blackjack!`;
      payout('blackjack');
      hitBtn.classList.add('hidden');
      standBtn.classList.add('hidden');
    };
  };
}
const flash = () => {
  if (outcome.textContent === `Blackjack!`) {
    outcome.classList.add('flash');
  } else {
    outcome.classList.remove('flash');
  };
}


// ############################ deal #############################

const regularOptions = () => {
  hitBtn.classList.remove('hidden');
  standBtn.classList.remove('hidden');
  checkBlackjack();
  if (deck.length < 100) {
    shuffleNext = true;
  }
}

const pickCard = (hand) => {
  let card = deck[0];
  deck.splice(0, 1);
  hand.push(card);
}

const deal = () => {
  dealerHand = [];
  playerHand = [];

  pickCard(dealerHand);
  pickCard(dealerHand);
  pickCard(playerHand);
  pickCard(playerHand);
  hands.push(playerHand);

  display(dealerHand, dealerCards);
  display(playerHand, playerCards);

  offerInsurance();
  offerSplit();
  offerDouble();
  dScoreDisplay.textContent = '';
  showScore(playerHand, playerScore, pScoreDisplay);
  regularOptions();


  roundsPlayed++;
  return deck;
};

// ############################ reset game ########################
const gameReset = () => {
  playerScore = 0;
  dealerScore = 0;
  totalBet = 0;
  insuranceBet = 0;
  hands = [];
  handCountDisplay.textContent = '';
  betAmtDisplay.textContent = `Bet: $${totalBet}`;
  insuranceDisplay.textContent = '';
  showPot();
  hitBtn.classList.add('hidden');
  standBtn.classList.add('hidden');
  extraBets.forEach(button => {
    button.classList.add('hidden');
  });
  clearBtn.disabled = true;
  betBtn.disabled = false;
  betNums.forEach(button => {
    button.disabled = false;
  });
  if (shuffleNext) {
    buildDeck();
  };
};

// ################# setting up win evaluation and payout ###############
const payout = condition => {
  switch (condition) {
    case 'insurance':
      pot += 3 * insuranceBet;
      showPot();
      insuranceDisplay.textContent = '';
    case 'loss':
      showPot();
      break;
    case 'win':
      pot += 2 * totalBet;
      showPot();
      break;
    case 'tie':
      pot += totalBet;
      showPot();
      break;
    case 'blackjack':
      pot += 2.5 * totalBet;
      showPot();
      break;
  }
  flash();
  if (hands.length > 1) {
    hands.shift();
    handCountDisplay.textContent = `Hands in play: ${hands.length}`;
    playerHand = [hands[0]];
    hit(playerHand, playerCards);
    display(playerHand, playerCards);
    showScore(playerHand, playerScore, pScoreDisplay);
  } else {
    gameReset();
  }
}


// ###################### check winner #########################
const assess = () => {
  playerScore = getScore(playerHand, playerScore);
  dealerScore = getScore(dealerHand, dealerScore);
  pScoreDisplay.textContent = playerScore;
  if (playerScore > 21) {
    outcome.textContent = `Bust! The house wins.`;
    payout('loss');
  } else {
    if (dealerScore > 21) {
      outcome.textContent = `Dealer bust! Player wins.`;
      payout('win');
    } else {
      if (playerScore === dealerScore) {
        outcome.textContent = `Push!`;
        payout('tie');
      } else if (playerScore > dealerScore) {
        outcome.textContent = `Player wins!`;
        payout('win');
      } else {
        outcome.textContent = `The house wins.`;
        payout('loss');
      }
    }
  }
}

const checkWinner = () => {
  dealerCards.firstChild.src = dealerHand[0].pic;
  showScore(dealerHand, dealerScore, dScoreDisplay);

  assess();

  if (dealerBlackjack) {
    payout('insurance');
  }
}


// ################### gameplay: hit or stand ########################
const hit = (hand, div) => {
  pickCard(hand);
  display(hand, div);
  extraBets.forEach(button => {
    button.classList.add('hidden');
  })
};

const splitHit = () => {
  if (hands.length > 1) {
    assess();
  } else {
    playerHand = [hands[1]];
    hit(playerHand, playerCards);
    regularOptions();
  }
}

const hitPlayer = () => {
  while (getScore(playerHand, playerScore) < 21) {
    hit(playerHand, playerCards);
    break;
  }
  if (getScore(playerHand, playerScore) >= 21) {
    if (hands.length > 1) {
      splitHit();
      checkBlackjack();
    } else {
      checkWinner();
    }
  }
  showScore(playerHand, playerScore, pScoreDisplay);
}

const hitDealer = () => {
  if (hands.length > 1) {
    splitHit();
    checkBlackjack();
  } else {
    if (dealerHand.some(card => card.num === 'Ace')) {
      while (getScore(dealerHand, dealerScore) <= 17) {
        while (dealerHand.length < 5) {
          hit(dealerHand, dealerCards);
          break;
        }
      }
    } else {
      while (getScore(dealerHand, dealerScore) < 17) {
        while (dealerHand.length < 5) {
          hit(dealerHand, dealerCards);
          break;
        }
      }
    }
    extraBets.forEach(button => {
      button.classList.add('hidden');
    })
    checkWinner();
  }
}

hitBtn.addEventListener('click', hitPlayer);
stand.addEventListener('click', hitDealer);


// ######################### gameplay: betting #######################
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

// ########################## cash out ##############################
const cashOut = () => {

  const evalPot = (a, b) => {
    let result;
    if (String(a - b).includes('.')) {
      result = `${a - b}O`;
    } else {
      result = a - b;
    }
    return result;
  };

  if (pot > 100) {
    if (roundsPlayed === 1) {
      cashOutDisplay.textContent = `You made $${evalPot(pot, 100)} in ${roundsPlayed} round!`;
    } else {
      cashOutDisplay.textContent = `You made $${evalPot(pot, 100)} in ${roundsPlayed} rounds!`;
    }
  } else if (pot < 100) {
    if (roundsPlayed === 1) {
      cashOutDisplay.textContent = `You lost ${evalPot(100, pot)} in ${roundsPlayed} round.`
    } else {
      cashOutDisplay.textContent = `You lost $${evalPot(100, pot)} in ${roundsPlayed} rounds.`;
    }
  } else {
    if (roundsPlayed === 1) {
      cashOutDisplay.textContent = `You broke even in ${roundsPlayed} round.`
    } else {
      cashOutDisplay.textContent = `You broke even across ${roundsPlayed} rounds!`;
    }
  }
  cashOutModal.style.display = 'block';
}
cashOutBtn.addEventListener('click', cashOut);
closeBtn.addEventListener('click', () => {
  cashOutModal.style.display = 'none';
  pot = 100;
  showPot();
  gameReset();
  buildDeck();
  roundsPlayed = 0;
});

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


const split = () => {
  let totalSplitBet = totalBet * 2;
  pot -= totalBet;
  showPot();
  betAmtDisplay.textContent = `Bet: $${totalSplitBet}`;
  hands = [];
  playerHand.forEach(card => {
    if (card.num === 'Ace') {
      card.value = 11;
    }
  });
  hands.push(playerHand[0], playerHand[1]);
  playerHand = [hands[0]];
  hit(playerHand, playerCards);
  showScore(playerHand, playerScore, pScoreDisplay);
  handCountDisplay.textContent = `Hands in play: ${hands.length}`;

  regularOptions();
}

// ######## placeholder for later features ########
splitBtn.addEventListener('click', split);

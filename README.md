# P1-Blackjack

Project proposal:
A blackjack game! Try to get your score as close to 21 as you can without going over, and try to beat the dealer! There's money at stake for each win/loss.

Technologies to utilize:
HTML, CSS, JS. Objects, click events, DOM manipulations, so many comparisons.



Anticipated problems:
  1) Conditionally valuing aces as either 11 or 1.
  2) Splitting cards
  3) Insurance
  4) Not running through the whole deck

Potential solutions to the above problems:
  1) Conditionals. Would the total score w/ ace as 11 be more than 21? If yes, ace = 1. Else, ace = 11;
  2) Put one aside somehow (move it? gray out?) and deal another with the same bet on it. Then compare both to dealer's hand in turn. Maybe active hands can be an array or something and I can loop through the length??
  3) If dealer has an ace *showing* (not facedown card... so check that) offer insurance. If insurance is taken, and dealer has blackjack, player wins their insurance bet 2:1. If not, they lose that bet. If insurance isn't taken, do nothing.
  4) Casinos apparently implement a yellow dummy card at a random spot in the deck and reshuffle all 8 decks when they reach it. I don't know anything about this. I think it would be possible to, upon shuffle, pick a random card to sort of be a trigger card to set a reshuffle, the tricky part of this would be figuring out how to have the current hand keep playing out if the yellow card is hit in the middle of a round.

# card-game
Online recreation of the Dobble/Spot It! card game

This is a game where you match the emojis at the bottom of your screen with the ones in the center. 

I chose this project because of the interesting deck requirements:

- Each card has exactly *one* emoji match with every other card.

Generating a playable number of cards via brute force would take O(n!) time to compute, but using the math outlined in [this](https://www.petercollingridge.co.uk/blog/mathematics-toys-and-games/dobble/) blog post, the algorithm can be simplified to generate much more efficiently.

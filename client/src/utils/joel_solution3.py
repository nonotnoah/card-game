N_VALUE = 7
def ordinary_points(n):
    pts = []
    for x in range(n):
        for y in range(n):
            pts.append((x, y))
    return pts

one = ordinary_points(N_VALUE)

def points_at_infinity(n):
    pts = list(range(n))
    pts.append('inf')
    return pts

two = points_at_infinity(N_VALUE)

def all_points(n):
    return ordinary_points(n) + points_at_infinity(n)

three = all_points(N_VALUE)

def ordinary_line(m, b, n):
    lines = []
    for x in range(n):
        lines.append((x, (m * x + b) % n))
    lines.append(m)
    return lines

def vertical_line(x, n):
    lines = []
    for y in range(n):
        lines.append((x, y))
    lines.append('inf')
    return lines

def line_at_infinity(n):
    return points_at_infinity(n)

def all_lines(n):
    lines = []
    for m in range(n):
        for b in range(n):
            lines.append(ordinary_line(m, b, n))
    
    for x in range(n):
        lines.append(vertical_line(x, n))

    lines.append(line_at_infinity(n))

    return lines

six = all_lines(N_VALUE)

# print(all_lines(7))

import random

with open(r"C:\Users\Noah\javascript-projects\card-game\client\src\utils\animals.txt", "r") as f:
    animals = [line.strip() for line in f]

def make_deck(n, pics):
    points = all_points(n)
    # print(points)

    mapping = {point: pic for point, pic in zip(points, pics)}
    # print(mapping)
    # print(all_lines(n))

    lines = []
    for line in all_lines(n):
        # cards = []
        # for animals in line:
        #     map_obj = mapping.get(animals)
        #     cards.append(map_obj)

        # lines.append(cards)
        map_obj = map(mapping.get, line)
        list_obj = list(map_obj)
        lines.append(list_obj)
    # lines.append(mapping.get(all_lines(n)[0][0]))
    # print(lines)

    # print(all_lines(n))

    return lines

# random.shuffle(animals)
deck = make_deck(7, animals)
print(deck)
# print(len(deck))
# for card in deck:
#     card1 = deck.pop()
#     card2 = deck.pop()
#     match = [pic for pic in card1 if pic in card2]

#     if len(match) == 0:
#         print(card1, card2)
#     else:
#         print(match)
# print(ordinary_points(7))
def play_game(deck):
    # make a copy so as not to much with the original deck, and then shuffle it
    deck = deck[:]
    random.shuffle(deck)

    # keep playing until fewer than 2 cards are left    
    while len(deck) >= 2:
        card1 = deck.pop()
        card2 = deck.pop()
        random.shuffle(card1)
        random.shuffle(card2)

        # find the matching element
        match, = [pic for pic in card1 if pic in card2]  

        print(card1)
        print(card2)
        
        guess = input("Match? ")
        if guess == match:
            print("correct!")
        else:
            print("incorrect!")

# play_game(deck)

# print('one:', one)
# print('two:', two)
# print('three:', three)
# print('six:', six)
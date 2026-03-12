# PRM392_DrinkApp

An Android drink ordering application developed for the PRM392 (Programming Mobile Application) course at FPT University.

## Features

- **User Authentication**: Register and login with username/password stored in local SQLite database
- **Drink Catalog**: Browse a curated list of drinks organized by categories (Coffee, Tea, Smoothie, Juice, Water)
- **Category Filter**: Filter drinks by category using chip buttons
- **Search**: Search drinks by name or description
- **Drink Details**: View full details of each drink with quantity selection
- **Shopping Cart**: Add drinks to cart, adjust quantities, and remove items
- **Order Placement**: Checkout with delivery address
- **Order History**: View past orders with full details

## Tech Stack

- **Platform**: Android (API 24+)
- **Language**: Java
- **Database**: SQLite (via SQLiteOpenHelper)
- **UI Components**: Material Design, RecyclerView, CardView, ChipGroup
- **Image Loading**: Glide
- **Architecture**: Activity-based with Adapter pattern

## Project Structure

```
app/src/main/
├── java/com/example/drinkapp/
│   ├── LoginActivity.java
│   ├── RegisterActivity.java
│   ├── MainActivity.java
│   ├── DrinkDetailActivity.java
│   ├── CartActivity.java
│   ├── OrderHistoryActivity.java
│   ├── models/
│   │   ├── Drink.java
│   │   ├── CartItem.java
│   │   ├── Order.java
│   │   └── User.java
│   ├── adapters/
│   │   ├── DrinkAdapter.java
│   │   ├── CartAdapter.java
│   │   └── OrderAdapter.java
│   ├── database/
│   │   └── DatabaseHelper.java
│   └── utils/
│       └── SessionManager.java
└── res/
    ├── layout/      (XML layouts)
    ├── values/      (strings, colors, themes)
    ├── drawable/    (vector icons)
    └── menu/        (action bar menus)
```

## Getting Started

1. Clone the repository
2. Open the project in Android Studio
3. Sync Gradle dependencies
4. Run on an emulator or physical device (API 24+)

## Sample Drinks

The app comes pre-loaded with 17 sample drinks across 5 categories:
- ☕ **Coffee**: Espresso, Cappuccino, Latte, Americano, Mocha
- 🍵 **Tea**: Matcha Latte, Earl Grey, Chamomile
- 🥤 **Smoothie**: Mango, Strawberry, Avocado
- 🍊 **Juice**: Orange, Apple, Watermelon, Lemonade
- 💧 **Water**: Sparkling Water, Coconut Water
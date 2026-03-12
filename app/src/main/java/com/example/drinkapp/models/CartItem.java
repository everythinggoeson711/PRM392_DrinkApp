package com.example.drinkapp.models;

public class CartItem {
    private int id;
    private int drinkId;
    private String drinkName;
    private double drinkPrice;
    private int quantity;
    private int userId;

    public CartItem() {}

    public CartItem(int drinkId, String drinkName, double drinkPrice, int quantity, int userId) {
        this.drinkId = drinkId;
        this.drinkName = drinkName;
        this.drinkPrice = drinkPrice;
        this.quantity = quantity;
        this.userId = userId;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getDrinkId() { return drinkId; }
    public void setDrinkId(int drinkId) { this.drinkId = drinkId; }

    public String getDrinkName() { return drinkName; }
    public void setDrinkName(String drinkName) { this.drinkName = drinkName; }

    public double getDrinkPrice() { return drinkPrice; }
    public void setDrinkPrice(double drinkPrice) { this.drinkPrice = drinkPrice; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public double getTotalPrice() {
        return drinkPrice * quantity;
    }
}

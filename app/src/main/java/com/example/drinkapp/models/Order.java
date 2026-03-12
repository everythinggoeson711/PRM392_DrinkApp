package com.example.drinkapp.models;

import java.util.List;

public class Order {
    private int id;
    private int userId;
    private String orderDate;
    private double totalAmount;
    private String status;
    private String deliveryAddress;
    private List<OrderItem> items;

    public Order() {}

    public Order(int userId, String orderDate, double totalAmount, String status, String deliveryAddress) {
        this.userId = userId;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.status = status;
        this.deliveryAddress = deliveryAddress;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getOrderDate() { return orderDate; }
    public void setOrderDate(String orderDate) { this.orderDate = orderDate; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public static class OrderItem {
        private int id;
        private int orderId;
        private int drinkId;
        private String drinkName;
        private double drinkPrice;
        private int quantity;

        public OrderItem() {}

        public OrderItem(int orderId, int drinkId, String drinkName, double drinkPrice, int quantity) {
            this.orderId = orderId;
            this.drinkId = drinkId;
            this.drinkName = drinkName;
            this.drinkPrice = drinkPrice;
            this.quantity = quantity;
        }

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }

        public int getOrderId() { return orderId; }
        public void setOrderId(int orderId) { this.orderId = orderId; }

        public int getDrinkId() { return drinkId; }
        public void setDrinkId(int drinkId) { this.drinkId = drinkId; }

        public String getDrinkName() { return drinkName; }
        public void setDrinkName(String drinkName) { this.drinkName = drinkName; }

        public double getDrinkPrice() { return drinkPrice; }
        public void setDrinkPrice(double drinkPrice) { this.drinkPrice = drinkPrice; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }

        public double getTotalPrice() { return drinkPrice * quantity; }
    }
}

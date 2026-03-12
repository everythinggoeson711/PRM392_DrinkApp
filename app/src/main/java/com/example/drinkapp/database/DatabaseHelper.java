package com.example.drinkapp.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.example.drinkapp.models.CartItem;
import com.example.drinkapp.models.Drink;
import com.example.drinkapp.models.Order;
import com.example.drinkapp.models.User;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "DrinkApp.db";
    private static final int DATABASE_VERSION = 1;

    // Table names
    public static final String TABLE_USERS = "users";
    public static final String TABLE_DRINKS = "drinks";
    public static final String TABLE_CART = "cart";
    public static final String TABLE_ORDERS = "orders";
    public static final String TABLE_ORDER_ITEMS = "order_items";

    // Common columns
    public static final String COL_ID = "id";

    // Users columns
    public static final String COL_USERNAME = "username";
    public static final String COL_PASSWORD = "password";
    public static final String COL_EMAIL = "email";
    public static final String COL_PHONE = "phone";
    public static final String COL_ADDRESS = "address";

    // Drinks columns
    public static final String COL_NAME = "name";
    public static final String COL_DESCRIPTION = "description";
    public static final String COL_PRICE = "price";
    public static final String COL_CATEGORY = "category";
    public static final String COL_IMAGE_URL = "image_url";
    public static final String COL_AVAILABLE = "available";

    // Cart columns
    public static final String COL_DRINK_ID = "drink_id";
    public static final String COL_DRINK_NAME = "drink_name";
    public static final String COL_DRINK_PRICE = "drink_price";
    public static final String COL_QUANTITY = "quantity";
    public static final String COL_USER_ID = "user_id";

    // Orders columns
    public static final String COL_ORDER_DATE = "order_date";
    public static final String COL_TOTAL_AMOUNT = "total_amount";
    public static final String COL_STATUS = "status";
    public static final String COL_DELIVERY_ADDRESS = "delivery_address";

    // Order items columns
    public static final String COL_ORDER_ID = "order_id";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String createUsersTable = "CREATE TABLE " + TABLE_USERS + " (" +
                COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COL_USERNAME + " TEXT UNIQUE NOT NULL, " +
                COL_PASSWORD + " TEXT NOT NULL, " +
                COL_EMAIL + " TEXT, " +
                COL_PHONE + " TEXT, " +
                COL_ADDRESS + " TEXT)";

        String createDrinksTable = "CREATE TABLE " + TABLE_DRINKS + " (" +
                COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COL_NAME + " TEXT NOT NULL, " +
                COL_DESCRIPTION + " TEXT, " +
                COL_PRICE + " REAL NOT NULL, " +
                COL_CATEGORY + " TEXT, " +
                COL_IMAGE_URL + " TEXT, " +
                COL_AVAILABLE + " INTEGER DEFAULT 1)";

        String createCartTable = "CREATE TABLE " + TABLE_CART + " (" +
                COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COL_DRINK_ID + " INTEGER NOT NULL, " +
                COL_DRINK_NAME + " TEXT NOT NULL, " +
                COL_DRINK_PRICE + " REAL NOT NULL, " +
                COL_QUANTITY + " INTEGER NOT NULL DEFAULT 1, " +
                COL_USER_ID + " INTEGER NOT NULL)";

        String createOrdersTable = "CREATE TABLE " + TABLE_ORDERS + " (" +
                COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COL_USER_ID + " INTEGER NOT NULL, " +
                COL_ORDER_DATE + " TEXT NOT NULL, " +
                COL_TOTAL_AMOUNT + " REAL NOT NULL, " +
                COL_STATUS + " TEXT DEFAULT 'Pending', " +
                COL_DELIVERY_ADDRESS + " TEXT)";

        String createOrderItemsTable = "CREATE TABLE " + TABLE_ORDER_ITEMS + " (" +
                COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COL_ORDER_ID + " INTEGER NOT NULL, " +
                COL_DRINK_ID + " INTEGER NOT NULL, " +
                COL_DRINK_NAME + " TEXT NOT NULL, " +
                COL_DRINK_PRICE + " REAL NOT NULL, " +
                COL_QUANTITY + " INTEGER NOT NULL)";

        db.execSQL(createUsersTable);
        db.execSQL(createDrinksTable);
        db.execSQL(createCartTable);
        db.execSQL(createOrdersTable);
        db.execSQL(createOrderItemsTable);

        insertSampleDrinks(db);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_ORDER_ITEMS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_ORDERS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_CART);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_DRINKS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_USERS);
        onCreate(db);
    }

    private void insertSampleDrinks(SQLiteDatabase db) {
        insertDrink(db, "Espresso", "Strong and rich Italian coffee", 35000, "Coffee", "", true);
        insertDrink(db, "Cappuccino", "Espresso with steamed milk foam", 45000, "Coffee", "", true);
        insertDrink(db, "Latte", "Espresso with steamed milk", 45000, "Coffee", "", true);
        insertDrink(db, "Americano", "Espresso diluted with hot water", 35000, "Coffee", "", true);
        insertDrink(db, "Mocha", "Chocolate-flavored coffee", 50000, "Coffee", "", true);
        insertDrink(db, "Matcha Latte", "Japanese green tea with milk", 55000, "Tea", "", true);
        insertDrink(db, "Earl Grey", "Classic black tea with bergamot", 40000, "Tea", "", true);
        insertDrink(db, "Chamomile", "Soothing herbal tea", 40000, "Tea", "", true);
        insertDrink(db, "Mango Smoothie", "Fresh mango blended with yogurt", 60000, "Smoothie", "", true);
        insertDrink(db, "Strawberry Smoothie", "Fresh strawberries with milk", 60000, "Smoothie", "", true);
        insertDrink(db, "Avocado Smoothie", "Creamy avocado blended with milk", 65000, "Smoothie", "", true);
        insertDrink(db, "Fresh Orange Juice", "Freshly squeezed orange juice", 45000, "Juice", "", true);
        insertDrink(db, "Apple Juice", "Fresh apple juice", 40000, "Juice", "", true);
        insertDrink(db, "Watermelon Juice", "Refreshing watermelon juice", 40000, "Juice", "", true);
        insertDrink(db, "Lemonade", "Fresh lemon juice with sugar", 35000, "Juice", "", true);
        insertDrink(db, "Sparkling Water", "Carbonated mineral water", 20000, "Water", "", true);
        insertDrink(db, "Coconut Water", "Natural coconut water", 30000, "Water", "", true);
    }

    private void insertDrink(SQLiteDatabase db, String name, String description, double price,
                              String category, String imageUrl, boolean available) {
        ContentValues values = new ContentValues();
        values.put(COL_NAME, name);
        values.put(COL_DESCRIPTION, description);
        values.put(COL_PRICE, price);
        values.put(COL_CATEGORY, category);
        values.put(COL_IMAGE_URL, imageUrl);
        values.put(COL_AVAILABLE, available ? 1 : 0);
        db.insert(TABLE_DRINKS, null, values);
    }

    // ==================== USER OPERATIONS ====================

    public long registerUser(User user) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_USERNAME, user.getUsername());
        values.put(COL_PASSWORD, user.getPassword());
        values.put(COL_EMAIL, user.getEmail());
        values.put(COL_PHONE, user.getPhone());
        values.put(COL_ADDRESS, user.getAddress());
        long result = db.insert(TABLE_USERS, null, values);
        db.close();
        return result;
    }

    public User loginUser(String username, String password) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_USERS,
                null,
                COL_USERNAME + "=? AND " + COL_PASSWORD + "=?",
                new String[]{username, password},
                null, null, null);
        User user = null;
        if (cursor != null && cursor.moveToFirst()) {
            user = new User();
            user.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_ID)));
            user.setUsername(cursor.getString(cursor.getColumnIndexOrThrow(COL_USERNAME)));
            user.setPassword(cursor.getString(cursor.getColumnIndexOrThrow(COL_PASSWORD)));
            user.setEmail(cursor.getString(cursor.getColumnIndexOrThrow(COL_EMAIL)));
            user.setPhone(cursor.getString(cursor.getColumnIndexOrThrow(COL_PHONE)));
            user.setAddress(cursor.getString(cursor.getColumnIndexOrThrow(COL_ADDRESS)));
            cursor.close();
        }
        db.close();
        return user;
    }

    public boolean isUsernameExists(String username) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_USERS,
                new String[]{COL_ID},
                COL_USERNAME + "=?",
                new String[]{username},
                null, null, null);
        boolean exists = cursor != null && cursor.getCount() > 0;
        if (cursor != null) cursor.close();
        db.close();
        return exists;
    }

    // ==================== DRINK OPERATIONS ====================

    public List<Drink> getAllDrinks() {
        List<Drink> drinks = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_DRINKS, null, null, null, null, null, COL_CATEGORY + " ASC");
        if (cursor != null && cursor.moveToFirst()) {
            do {
                drinks.add(cursorToDrink(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        db.close();
        return drinks;
    }

    public List<Drink> getDrinksByCategory(String category) {
        List<Drink> drinks = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_DRINKS, null,
                COL_CATEGORY + "=?",
                new String[]{category},
                null, null, COL_NAME + " ASC");
        if (cursor != null && cursor.moveToFirst()) {
            do {
                drinks.add(cursorToDrink(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        db.close();
        return drinks;
    }

    public List<String> getCategories() {
        List<String> categories = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT DISTINCT " + COL_CATEGORY + " FROM " + TABLE_DRINKS +
                " ORDER BY " + COL_CATEGORY + " ASC", null);
        if (cursor != null && cursor.moveToFirst()) {
            do {
                categories.add(cursor.getString(0));
            } while (cursor.moveToNext());
            cursor.close();
        }
        db.close();
        return categories;
    }

    public Drink getDrinkById(int id) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_DRINKS, null,
                COL_ID + "=?",
                new String[]{String.valueOf(id)},
                null, null, null);
        Drink drink = null;
        if (cursor != null && cursor.moveToFirst()) {
            drink = cursorToDrink(cursor);
            cursor.close();
        }
        db.close();
        return drink;
    }

    public List<Drink> searchDrinks(String query) {
        List<Drink> drinks = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_DRINKS, null,
                COL_NAME + " LIKE ? OR " + COL_DESCRIPTION + " LIKE ?",
                new String[]{"%" + query + "%", "%" + query + "%"},
                null, null, COL_NAME + " ASC");
        if (cursor != null && cursor.moveToFirst()) {
            do {
                drinks.add(cursorToDrink(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        db.close();
        return drinks;
    }

    private Drink cursorToDrink(Cursor cursor) {
        Drink drink = new Drink();
        drink.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_ID)));
        drink.setName(cursor.getString(cursor.getColumnIndexOrThrow(COL_NAME)));
        drink.setDescription(cursor.getString(cursor.getColumnIndexOrThrow(COL_DESCRIPTION)));
        drink.setPrice(cursor.getDouble(cursor.getColumnIndexOrThrow(COL_PRICE)));
        drink.setCategory(cursor.getString(cursor.getColumnIndexOrThrow(COL_CATEGORY)));
        drink.setImageUrl(cursor.getString(cursor.getColumnIndexOrThrow(COL_IMAGE_URL)));
        drink.setAvailable(cursor.getInt(cursor.getColumnIndexOrThrow(COL_AVAILABLE)) == 1);
        return drink;
    }

    // ==================== CART OPERATIONS ====================

    public long addToCart(CartItem item) {
        SQLiteDatabase db = this.getWritableDatabase();
        // Check if item already exists in cart
        Cursor cursor = db.query(TABLE_CART, null,
                COL_DRINK_ID + "=? AND " + COL_USER_ID + "=?",
                new String[]{String.valueOf(item.getDrinkId()), String.valueOf(item.getUserId())},
                null, null, null);
        long result;
        if (cursor != null && cursor.moveToFirst()) {
            int existingQty = cursor.getInt(cursor.getColumnIndexOrThrow(COL_QUANTITY));
            int cartId = cursor.getInt(cursor.getColumnIndexOrThrow(COL_ID));
            cursor.close();
            ContentValues values = new ContentValues();
            values.put(COL_QUANTITY, existingQty + item.getQuantity());
            result = db.update(TABLE_CART, values, COL_ID + "=?", new String[]{String.valueOf(cartId)});
        } else {
            if (cursor != null) cursor.close();
            ContentValues values = new ContentValues();
            values.put(COL_DRINK_ID, item.getDrinkId());
            values.put(COL_DRINK_NAME, item.getDrinkName());
            values.put(COL_DRINK_PRICE, item.getDrinkPrice());
            values.put(COL_QUANTITY, item.getQuantity());
            values.put(COL_USER_ID, item.getUserId());
            result = db.insert(TABLE_CART, null, values);
        }
        db.close();
        return result;
    }

    public List<CartItem> getCartItems(int userId) {
        List<CartItem> items = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_CART, null,
                COL_USER_ID + "=?",
                new String[]{String.valueOf(userId)},
                null, null, null);
        if (cursor != null && cursor.moveToFirst()) {
            do {
                CartItem item = new CartItem();
                item.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_ID)));
                item.setDrinkId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_DRINK_ID)));
                item.setDrinkName(cursor.getString(cursor.getColumnIndexOrThrow(COL_DRINK_NAME)));
                item.setDrinkPrice(cursor.getDouble(cursor.getColumnIndexOrThrow(COL_DRINK_PRICE)));
                item.setQuantity(cursor.getInt(cursor.getColumnIndexOrThrow(COL_QUANTITY)));
                item.setUserId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_USER_ID)));
                items.add(item);
            } while (cursor.moveToNext());
            cursor.close();
        }
        db.close();
        return items;
    }

    public void updateCartItemQuantity(int cartId, int quantity) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_QUANTITY, quantity);
        db.update(TABLE_CART, values, COL_ID + "=?", new String[]{String.valueOf(cartId)});
        db.close();
    }

    public void removeCartItem(int cartId) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_CART, COL_ID + "=?", new String[]{String.valueOf(cartId)});
        db.close();
    }

    public void clearCart(int userId) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_CART, COL_USER_ID + "=?", new String[]{String.valueOf(userId)});
        db.close();
    }

    public int getCartItemCount(int userId) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT SUM(" + COL_QUANTITY + ") FROM " + TABLE_CART +
                " WHERE " + COL_USER_ID + "=?", new String[]{String.valueOf(userId)});
        int count = 0;
        if (cursor != null && cursor.moveToFirst()) {
            count = cursor.getInt(0);
            cursor.close();
        }
        db.close();
        return count;
    }

    // ==================== ORDER OPERATIONS ====================

    public long placeOrder(int userId, String deliveryAddress, List<CartItem> cartItems) {
        SQLiteDatabase db = this.getWritableDatabase();
        double totalAmount = 0;
        for (CartItem item : cartItems) {
            totalAmount += item.getTotalPrice();
        }

        String orderDate = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(new Date());

        ContentValues orderValues = new ContentValues();
        orderValues.put(COL_USER_ID, userId);
        orderValues.put(COL_ORDER_DATE, orderDate);
        orderValues.put(COL_TOTAL_AMOUNT, totalAmount);
        orderValues.put(COL_STATUS, "Pending");
        orderValues.put(COL_DELIVERY_ADDRESS, deliveryAddress);

        long orderId = db.insert(TABLE_ORDERS, null, orderValues);

        for (CartItem item : cartItems) {
            ContentValues itemValues = new ContentValues();
            itemValues.put(COL_ORDER_ID, orderId);
            itemValues.put(COL_DRINK_ID, item.getDrinkId());
            itemValues.put(COL_DRINK_NAME, item.getDrinkName());
            itemValues.put(COL_DRINK_PRICE, item.getDrinkPrice());
            itemValues.put(COL_QUANTITY, item.getQuantity());
            db.insert(TABLE_ORDER_ITEMS, null, itemValues);
        }

        // Clear cart after placing order
        db.delete(TABLE_CART, COL_USER_ID + "=?", new String[]{String.valueOf(userId)});

        db.close();
        return orderId;
    }

    public List<Order> getOrdersByUser(int userId) {
        List<Order> orders = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_ORDERS, null,
                COL_USER_ID + "=?",
                new String[]{String.valueOf(userId)},
                null, null, COL_ID + " DESC");
        if (cursor != null && cursor.moveToFirst()) {
            do {
                Order order = new Order();
                order.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_ID)));
                order.setUserId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_USER_ID)));
                order.setOrderDate(cursor.getString(cursor.getColumnIndexOrThrow(COL_ORDER_DATE)));
                order.setTotalAmount(cursor.getDouble(cursor.getColumnIndexOrThrow(COL_TOTAL_AMOUNT)));
                order.setStatus(cursor.getString(cursor.getColumnIndexOrThrow(COL_STATUS)));
                order.setDeliveryAddress(cursor.getString(cursor.getColumnIndexOrThrow(COL_DELIVERY_ADDRESS)));
                orders.add(order);
            } while (cursor.moveToNext());
            cursor.close();
        }
        db.close();
        return orders;
    }

    public List<Order.OrderItem> getOrderItems(int orderId) {
        List<Order.OrderItem> items = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_ORDER_ITEMS, null,
                COL_ORDER_ID + "=?",
                new String[]{String.valueOf(orderId)},
                null, null, null);
        if (cursor != null && cursor.moveToFirst()) {
            do {
                Order.OrderItem item = new Order.OrderItem();
                item.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_ID)));
                item.setOrderId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_ORDER_ID)));
                item.setDrinkId(cursor.getInt(cursor.getColumnIndexOrThrow(COL_DRINK_ID)));
                item.setDrinkName(cursor.getString(cursor.getColumnIndexOrThrow(COL_DRINK_NAME)));
                item.setDrinkPrice(cursor.getDouble(cursor.getColumnIndexOrThrow(COL_DRINK_PRICE)));
                item.setQuantity(cursor.getInt(cursor.getColumnIndexOrThrow(COL_QUANTITY)));
                items.add(item);
            } while (cursor.moveToNext());
            cursor.close();
        }
        db.close();
        return items;
    }
}

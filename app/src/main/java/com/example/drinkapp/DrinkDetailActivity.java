package com.example.drinkapp;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.drinkapp.database.DatabaseHelper;
import com.example.drinkapp.models.CartItem;
import com.example.drinkapp.models.Drink;
import com.example.drinkapp.utils.SessionManager;

import java.util.Locale;

public class DrinkDetailActivity extends AppCompatActivity {

    private TextView tvName, tvCategory, tvPrice, tvDescription, tvQuantity;
    private Button btnAddToCart, btnIncrease, btnDecrease;
    private DatabaseHelper dbHelper;
    private SessionManager sessionManager;
    private Drink drink;
    private int quantity = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drink_detail);

        dbHelper = new DatabaseHelper(this);
        sessionManager = new SessionManager(this);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        tvName = findViewById(R.id.tv_detail_name);
        tvCategory = findViewById(R.id.tv_detail_category);
        tvPrice = findViewById(R.id.tv_detail_price);
        tvDescription = findViewById(R.id.tv_detail_description);
        tvQuantity = findViewById(R.id.tv_detail_quantity);
        btnAddToCart = findViewById(R.id.btn_detail_add_to_cart);
        btnIncrease = findViewById(R.id.btn_detail_increase);
        btnDecrease = findViewById(R.id.btn_detail_decrease);

        int drinkId = getIntent().getIntExtra("drink_id", -1);
        if (drinkId == -1) {
            finish();
            return;
        }

        drink = dbHelper.getDrinkById(drinkId);
        if (drink == null) {
            finish();
            return;
        }

        displayDrink();

        btnIncrease.setOnClickListener(v -> {
            quantity++;
            tvQuantity.setText(String.valueOf(quantity));
        });

        btnDecrease.setOnClickListener(v -> {
            if (quantity > 1) {
                quantity--;
                tvQuantity.setText(String.valueOf(quantity));
            }
        });

        btnAddToCart.setOnClickListener(v -> addToCart());
    }

    private void displayDrink() {
        tvName.setText(drink.getName());
        tvCategory.setText(drink.getCategory());
        tvPrice.setText(String.format(Locale.getDefault(), "%,.0f đ", drink.getPrice()));
        tvDescription.setText(drink.getDescription());
        tvQuantity.setText(String.valueOf(quantity));

        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(drink.getName());
        }
    }

    private void addToCart() {
        CartItem cartItem = new CartItem(drink.getId(), drink.getName(), drink.getPrice(), quantity, sessionManager.getUserId());
        dbHelper.addToCart(cartItem);
        Toast.makeText(this, getString(R.string.added_to_cart, drink.getName()), Toast.LENGTH_SHORT).show();
        finish();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}

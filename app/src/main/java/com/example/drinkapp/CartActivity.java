package com.example.drinkapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.drinkapp.adapters.CartAdapter;
import com.example.drinkapp.database.DatabaseHelper;
import com.example.drinkapp.models.CartItem;
import com.example.drinkapp.utils.SessionManager;

import java.util.List;
import java.util.Locale;

public class CartActivity extends AppCompatActivity implements CartAdapter.OnCartItemListener {

    private RecyclerView rvCart;
    private TextView tvTotal, tvEmpty;
    private Button btnCheckout;
    private LinearLayout layoutCartContent;
    private CartAdapter cartAdapter;
    private List<CartItem> cartItems;
    private DatabaseHelper dbHelper;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cart);

        dbHelper = new DatabaseHelper(this);
        sessionManager = new SessionManager(this);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.cart);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        rvCart = findViewById(R.id.rv_cart);
        tvTotal = findViewById(R.id.tv_cart_total);
        tvEmpty = findViewById(R.id.tv_cart_empty);
        btnCheckout = findViewById(R.id.btn_checkout);
        layoutCartContent = findViewById(R.id.layout_cart_content);

        rvCart.setLayoutManager(new LinearLayoutManager(this));

        loadCart();

        btnCheckout.setOnClickListener(v -> showCheckoutDialog());
    }

    private void loadCart() {
        cartItems = dbHelper.getCartItems(sessionManager.getUserId());
        cartAdapter = new CartAdapter(this, cartItems, this);
        rvCart.setAdapter(cartAdapter);
        updateTotal();
        updateEmptyState();
    }

    private void updateTotal() {
        double total = 0;
        for (CartItem item : cartItems) {
            total += item.getTotalPrice();
        }
        tvTotal.setText(String.format(Locale.getDefault(), "%,.0f đ", total));
    }

    private void updateEmptyState() {
        if (cartItems.isEmpty()) {
            tvEmpty.setVisibility(View.VISIBLE);
            layoutCartContent.setVisibility(View.GONE);
        } else {
            tvEmpty.setVisibility(View.GONE);
            layoutCartContent.setVisibility(View.VISIBLE);
        }
    }

    private void showCheckoutDialog() {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_checkout, null);
        EditText etAddress = dialogView.findViewById(R.id.et_delivery_address);

        new AlertDialog.Builder(this)
                .setTitle(R.string.checkout)
                .setView(dialogView)
                .setPositiveButton(R.string.place_order, (dialog, which) -> {
                    String address = etAddress.getText().toString().trim();
                    if (address.isEmpty()) {
                        Toast.makeText(this, getString(R.string.error_address_required), Toast.LENGTH_SHORT).show();
                        return;
                    }
                    placeOrder(address);
                })
                .setNegativeButton(R.string.cancel, null)
                .show();
    }

    private void placeOrder(String address) {
        long orderId = dbHelper.placeOrder(sessionManager.getUserId(), address, cartItems);
        if (orderId != -1) {
            Toast.makeText(this, getString(R.string.order_placed_success), Toast.LENGTH_LONG).show();
            startActivity(new Intent(this, OrderHistoryActivity.class));
            finish();
        } else {
            Toast.makeText(this, getString(R.string.order_failed), Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onQuantityIncrease(CartItem item, int position) {
        item.setQuantity(item.getQuantity() + 1);
        dbHelper.updateCartItemQuantity(item.getId(), item.getQuantity());
        cartAdapter.notifyItemChanged(position);
        updateTotal();
    }

    @Override
    public void onQuantityDecrease(CartItem item, int position) {
        if (item.getQuantity() > 1) {
            item.setQuantity(item.getQuantity() - 1);
            dbHelper.updateCartItemQuantity(item.getId(), item.getQuantity());
            cartAdapter.notifyItemChanged(position);
            updateTotal();
        }
    }

    @Override
    public void onRemoveItem(CartItem item, int position) {
        new AlertDialog.Builder(this)
                .setTitle(R.string.remove_item)
                .setMessage(R.string.remove_item_confirm)
                .setPositiveButton(R.string.yes, (dialog, which) -> {
                    dbHelper.removeCartItem(item.getId());
                    cartItems.remove(position);
                    cartAdapter.notifyItemRemoved(position);
                    cartAdapter.notifyItemRangeChanged(position, cartItems.size());
                    updateTotal();
                    updateEmptyState();
                })
                .setNegativeButton(R.string.no, null)
                .show();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}

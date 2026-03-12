package com.example.drinkapp;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.drinkapp.adapters.OrderAdapter;
import com.example.drinkapp.database.DatabaseHelper;
import com.example.drinkapp.models.Order;
import com.example.drinkapp.utils.SessionManager;

import java.util.List;
import java.util.Locale;

public class OrderHistoryActivity extends AppCompatActivity implements OrderAdapter.OnOrderClickListener {

    private RecyclerView rvOrders;
    private TextView tvEmpty;
    private DatabaseHelper dbHelper;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_history);

        dbHelper = new DatabaseHelper(this);
        sessionManager = new SessionManager(this);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.order_history);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        rvOrders = findViewById(R.id.rv_orders);
        tvEmpty = findViewById(R.id.tv_orders_empty);

        rvOrders.setLayoutManager(new LinearLayoutManager(this));

        loadOrders();
    }

    private void loadOrders() {
        List<Order> orders = dbHelper.getOrdersByUser(sessionManager.getUserId());
        if (orders.isEmpty()) {
            rvOrders.setVisibility(View.GONE);
            tvEmpty.setVisibility(View.VISIBLE);
        } else {
            rvOrders.setVisibility(View.VISIBLE);
            tvEmpty.setVisibility(View.GONE);
            OrderAdapter adapter = new OrderAdapter(this, orders, this);
            rvOrders.setAdapter(adapter);
        }
    }

    @Override
    public void onOrderClick(Order order) {
        List<Order.OrderItem> items = dbHelper.getOrderItems(order.getId());
        StringBuilder sb = new StringBuilder();
        sb.append(getString(R.string.order_date_label)).append(order.getOrderDate()).append("\n\n");
        sb.append(getString(R.string.order_items_label)).append("\n");
        for (Order.OrderItem item : items) {
            sb.append("• ").append(item.getDrinkName())
                    .append(" x").append(item.getQuantity())
                    .append(" = ").append(String.format(Locale.getDefault(), "%,.0f đ", item.getTotalPrice()))
                    .append("\n");
        }
        sb.append("\n").append(getString(R.string.total_label))
                .append(String.format(Locale.getDefault(), "%,.0f đ", order.getTotalAmount()));
        sb.append("\n\n").append(getString(R.string.status_label)).append(order.getStatus());
        sb.append("\n").append(getString(R.string.delivery_address_label)).append(order.getDeliveryAddress());

        new AlertDialog.Builder(this)
                .setTitle(getString(R.string.order_detail_title, order.getId()))
                .setMessage(sb.toString())
                .setPositiveButton(R.string.ok, null)
                .show();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}

package com.example.drinkapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.drinkapp.adapters.DrinkAdapter;
import com.example.drinkapp.database.DatabaseHelper;
import com.example.drinkapp.models.CartItem;
import com.example.drinkapp.models.Drink;
import com.example.drinkapp.utils.SessionManager;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;

import java.util.List;

public class MainActivity extends AppCompatActivity implements DrinkAdapter.OnDrinkClickListener {

    private RecyclerView rvDrinks;
    private ChipGroup chipGroupCategories;
    private TextView tvWelcome;
    private DrinkAdapter drinkAdapter;
    private DatabaseHelper dbHelper;
    private SessionManager sessionManager;
    private List<Drink> allDrinks;
    private String selectedCategory = "All";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        dbHelper = new DatabaseHelper(this);
        sessionManager = new SessionManager(this);

        if (!sessionManager.isLoggedIn()) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        setSupportActionBar(findViewById(R.id.toolbar));

        tvWelcome = findViewById(R.id.tv_welcome);
        tvWelcome.setText(getString(R.string.welcome_user, sessionManager.getUsername()));

        rvDrinks = findViewById(R.id.rv_drinks);
        rvDrinks.setLayoutManager(new GridLayoutManager(this, 2));

        chipGroupCategories = findViewById(R.id.chip_group_categories);

        allDrinks = dbHelper.getAllDrinks();
        drinkAdapter = new DrinkAdapter(this, allDrinks, this);
        rvDrinks.setAdapter(drinkAdapter);

        setupCategoryChips();
    }

    private void setupCategoryChips() {
        // Add "All" chip
        Chip chipAll = new Chip(this);
        chipAll.setText(R.string.category_all);
        chipAll.setCheckable(true);
        chipAll.setChecked(true);
        chipGroupCategories.addView(chipAll);
        chipAll.setOnClickListener(v -> {
            selectedCategory = "All";
            drinkAdapter.updateDrinks(allDrinks);
        });

        List<String> categories = dbHelper.getCategories();
        for (String category : categories) {
            Chip chip = new Chip(this);
            chip.setText(category);
            chip.setCheckable(true);
            chipGroupCategories.addView(chip);
            chip.setOnClickListener(v -> {
                selectedCategory = category;
                List<Drink> filtered = dbHelper.getDrinksByCategory(category);
                drinkAdapter.updateDrinks(filtered);
            });
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);

        MenuItem searchItem = menu.findItem(R.id.action_search);
        SearchView searchView = (SearchView) searchItem.getActionView();
        if (searchView != null) {
            searchView.setQueryHint(getString(R.string.search_hint));
            searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
                @Override
                public boolean onQueryTextSubmit(String query) {
                    performSearch(query);
                    return true;
                }

                @Override
                public boolean onQueryTextChange(String newText) {
                    if (newText.isEmpty()) {
                        if (selectedCategory.equals("All")) {
                            drinkAdapter.updateDrinks(allDrinks);
                        } else {
                            drinkAdapter.updateDrinks(dbHelper.getDrinksByCategory(selectedCategory));
                        }
                    } else {
                        performSearch(newText);
                    }
                    return true;
                }
            });
        }

        updateCartBadge(menu);
        return true;
    }

    private void performSearch(String query) {
        List<Drink> results = dbHelper.searchDrinks(query);
        drinkAdapter.updateDrinks(results);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_cart) {
            startActivity(new Intent(this, CartActivity.class));
            return true;
        } else if (id == R.id.action_history) {
            startActivity(new Intent(this, OrderHistoryActivity.class));
            return true;
        } else if (id == R.id.action_logout) {
            showLogoutDialog();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void updateCartBadge(Menu menu) {
        int count = dbHelper.getCartItemCount(sessionManager.getUserId());
        MenuItem cartItem = menu.findItem(R.id.action_cart);
        if (cartItem != null) {
            cartItem.setTitle(count > 0 ? getString(R.string.cart_with_count, count) : getString(R.string.cart));
        }
    }

    private void showLogoutDialog() {
        new AlertDialog.Builder(this)
                .setTitle(R.string.logout)
                .setMessage(R.string.logout_confirm)
                .setPositiveButton(R.string.yes, (dialog, which) -> {
                    sessionManager.logout();
                    startActivity(new Intent(this, LoginActivity.class));
                    finish();
                })
                .setNegativeButton(R.string.no, null)
                .show();
    }

    @Override
    public void onDrinkClick(Drink drink) {
        Intent intent = new Intent(this, DrinkDetailActivity.class);
        intent.putExtra("drink_id", drink.getId());
        startActivity(intent);
    }

    @Override
    public void onAddToCartClick(Drink drink) {
        CartItem cartItem = new CartItem(drink.getId(), drink.getName(), drink.getPrice(), 1, sessionManager.getUserId());
        dbHelper.addToCart(cartItem);
        Toast.makeText(this, getString(R.string.added_to_cart, drink.getName()), Toast.LENGTH_SHORT).show();
        invalidateOptionsMenu();
    }

    @Override
    protected void onResume() {
        super.onResume();
        invalidateOptionsMenu();
    }
}

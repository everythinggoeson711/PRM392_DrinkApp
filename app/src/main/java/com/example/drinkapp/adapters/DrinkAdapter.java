package com.example.drinkapp.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.drinkapp.R;
import com.example.drinkapp.models.Drink;

import java.util.List;
import java.util.Locale;

public class DrinkAdapter extends RecyclerView.Adapter<DrinkAdapter.DrinkViewHolder> {

    private final Context context;
    private List<Drink> drinks;
    private final OnDrinkClickListener listener;

    public interface OnDrinkClickListener {
        void onDrinkClick(Drink drink);
        void onAddToCartClick(Drink drink);
    }

    public DrinkAdapter(Context context, List<Drink> drinks, OnDrinkClickListener listener) {
        this.context = context;
        this.drinks = drinks;
        this.listener = listener;
    }

    @NonNull
    @Override
    public DrinkViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_drink, parent, false);
        return new DrinkViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull DrinkViewHolder holder, int position) {
        Drink drink = drinks.get(position);
        holder.tvName.setText(drink.getName());
        holder.tvCategory.setText(drink.getCategory());
        holder.tvPrice.setText(String.format(Locale.getDefault(), "%,.0f đ", drink.getPrice()));
        holder.tvDescription.setText(drink.getDescription());

        holder.itemView.setOnClickListener(v -> listener.onDrinkClick(drink));
        holder.btnAddToCart.setOnClickListener(v -> listener.onAddToCartClick(drink));
    }

    @Override
    public int getItemCount() {
        return drinks.size();
    }

    public void updateDrinks(List<Drink> newDrinks) {
        this.drinks = newDrinks;
        notifyDataSetChanged();
    }

    static class DrinkViewHolder extends RecyclerView.ViewHolder {
        ImageView ivDrink;
        TextView tvName;
        TextView tvCategory;
        TextView tvPrice;
        TextView tvDescription;
        View btnAddToCart;

        DrinkViewHolder(@NonNull View itemView) {
            super(itemView);
            ivDrink = itemView.findViewById(R.id.iv_drink);
            tvName = itemView.findViewById(R.id.tv_drink_name);
            tvCategory = itemView.findViewById(R.id.tv_drink_category);
            tvPrice = itemView.findViewById(R.id.tv_drink_price);
            tvDescription = itemView.findViewById(R.id.tv_drink_description);
            btnAddToCart = itemView.findViewById(R.id.btn_add_to_cart);
        }
    }
}

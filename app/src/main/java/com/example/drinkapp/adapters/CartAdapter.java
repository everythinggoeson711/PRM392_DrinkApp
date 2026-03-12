package com.example.drinkapp.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.drinkapp.R;
import com.example.drinkapp.models.CartItem;

import java.util.List;
import java.util.Locale;

public class CartAdapter extends RecyclerView.Adapter<CartAdapter.CartViewHolder> {

    private final Context context;
    private final List<CartItem> cartItems;
    private final OnCartItemListener listener;

    public interface OnCartItemListener {
        void onQuantityIncrease(CartItem item, int position);
        void onQuantityDecrease(CartItem item, int position);
        void onRemoveItem(CartItem item, int position);
    }

    public CartAdapter(Context context, List<CartItem> cartItems, OnCartItemListener listener) {
        this.context = context;
        this.cartItems = cartItems;
        this.listener = listener;
    }

    @NonNull
    @Override
    public CartViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_cart, parent, false);
        return new CartViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CartViewHolder holder, int position) {
        CartItem item = cartItems.get(position);
        holder.tvName.setText(item.getDrinkName());
        holder.tvPrice.setText(String.format(Locale.getDefault(), "%,.0f đ", item.getDrinkPrice()));
        holder.tvQuantity.setText(String.valueOf(item.getQuantity()));
        holder.tvTotal.setText(String.format(Locale.getDefault(), "%,.0f đ", item.getTotalPrice()));

        holder.btnIncrease.setOnClickListener(v -> listener.onQuantityIncrease(item, position));
        holder.btnDecrease.setOnClickListener(v -> listener.onQuantityDecrease(item, position));
        holder.btnRemove.setOnClickListener(v -> listener.onRemoveItem(item, position));
    }

    @Override
    public int getItemCount() {
        return cartItems.size();
    }

    static class CartViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvPrice, tvQuantity, tvTotal;
        ImageButton btnIncrease, btnDecrease, btnRemove;

        CartViewHolder(@NonNull View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_cart_item_name);
            tvPrice = itemView.findViewById(R.id.tv_cart_item_price);
            tvQuantity = itemView.findViewById(R.id.tv_cart_item_quantity);
            tvTotal = itemView.findViewById(R.id.tv_cart_item_total);
            btnIncrease = itemView.findViewById(R.id.btn_increase_quantity);
            btnDecrease = itemView.findViewById(R.id.btn_decrease_quantity);
            btnRemove = itemView.findViewById(R.id.btn_remove_item);
        }
    }
}

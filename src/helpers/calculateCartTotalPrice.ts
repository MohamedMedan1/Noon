export const calculateCartTotalPrice = (cart: any, sellerId?: string) => {
  let cartTotalPrice = 0;

  if (sellerId) {
    cartTotalPrice = cart.cartItems.reduce((acc: number, curItem: any) => {
      if (curItem.product.seller.userId === sellerId)
        return acc + curItem.product.price * curItem.quantity;
      else return acc;
    }, 0);
  } else {
    cartTotalPrice = cart.cartItems.reduce((acc: number, curItem: any) => (acc + (curItem.product.price * curItem.quantity)) ,0);
  }

  return cartTotalPrice;
};
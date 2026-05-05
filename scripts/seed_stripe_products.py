import stripe
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_stripe_key():
    try:
        from replit_connectors import ReplitConnectors
        connectors = ReplitConnectors()
        conn = connectors.get_connection("stripe")
        return conn.get("secret") or conn.get("api_key")
    except Exception:
        pass
    return os.getenv("STRIPE_SECRET_KEY", "")

def seed():
    key = get_stripe_key()
    if not key:
        print("No Stripe secret key found")
        return

    stripe.api_key = key
    print(f"Using Stripe key: {key[:12]}...")

    credit_packages = [
        {
            "name": "Starter Pack",
            "description": "50 credits for LayerOn modules",
            "metadata": {"credits": "50", "type": "credit_pack"},
            "price_cents": 499,
        },
        {
            "name": "Pro Pack",
            "description": "200 credits for LayerOn modules",
            "metadata": {"credits": "200", "type": "credit_pack", "popular": "true"},
            "price_cents": 1499,
        },
        {
            "name": "Power Pack",
            "description": "500 credits for LayerOn modules",
            "metadata": {"credits": "500", "type": "credit_pack"},
            "price_cents": 2999,
        },
    ]

    for pkg in credit_packages:
        existing = stripe.Product.search(query=f"name:'{pkg['name']}'")
        if existing.data:
            print(f"'{pkg['name']}' already exists (id: {existing.data[0].id})")
            prices = stripe.Price.list(product=existing.data[0].id, active=True)
            if prices.data:
                print(f"  Price: {prices.data[0].id} ({prices.data[0].unit_amount} cents)")
            continue

        product = stripe.Product.create(
            name=pkg["name"],
            description=pkg["description"],
            metadata=pkg["metadata"],
        )
        print(f"Created product: {product.id} ({pkg['name']})")

        price = stripe.Price.create(
            product=product.id,
            unit_amount=pkg["price_cents"],
            currency="usd",
        )
        print(f"  Created price: {price.id} ({pkg['price_cents']} cents)")

    print("\nDone! Credit packages seeded in Stripe.")

if __name__ == "__main__":
    seed()

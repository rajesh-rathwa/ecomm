import Link from "next/link";

export default function OrderSuccessPage() {

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "20px",
            }}
        >

            <h1
                style={{
                    color: "green",
                    fontSize: "40px",
                }}
            >
                Order Placed Successfully
            </h1>

            <p>
                Thank you for shopping with us.
            </p>

            <Link
                href="/"
                style={{
                    background: "black",
                    color: "white",
                    padding: "12px 20px",
                    textDecoration: "none",
                }}
            >
                Continue Shopping
            </Link>

        </div>

    );
}
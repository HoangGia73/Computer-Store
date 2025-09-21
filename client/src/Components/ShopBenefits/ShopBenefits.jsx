import styles from "./ShopBenefits.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

// 4 items cố định (icon + title + sub)
const BENEFITS = [
    {
        title: "GIAO HÀNG TOÀN QUỐC",
        sub: "Giao hàng trước, trả tiền sau COD",
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M3 7h11v7h2.5l2-3H21V9l-3-3h-4V4H3v3zm0 9h1a2 2 0 1 0 4 0h6a2 2 0 1 0 4 0h1v-5h-2l-2 3H3v2zM7 18a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm12 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
            </svg>
        ),
    },
    {
        title: "ĐỔI TRẢ DỄ DÀNG",
        sub: "Đổi mới trong 30 ngày đầu",
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M12 6V3L7 7l5 4V8a5 5 0 1 1-4.9 6H5a7 7 0 1 0 7-8z" />
            </svg>
        ),
    },
    {
        title: "THANH TOÁN TIỆN LỢI",
        sub: "Tiền mặt, chuyển khoản, trả góp 0%",
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M2 7a3 3 0 0 1 3-3h11a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7zm16 1V6H5a1 1 0 0 0-1 1v1h14zm-3 5h4a1 1 0 0 0 0-2h-4a1 1 0 0 0 0 2z" />
            </svg>
        ),
    },
    {
        title: "HỖ TRỢ NHIỆT TÌNH",
        sub: "Tư vấn tổng đài miễn phí",
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M12 3a7 7 0 0 0-7 7v6a3 3 0 0 0 3 3h2v-2H8a1 1 0 0 1-1-1v-2h3v-2H7v-2a5 5 0 1 1 10 0v2h-3v2h3v2a1 1 0 0 1-1 1h-2v2h2a3 3 0 0 0 3-3v-6a7 7 0 0 0-7-7z" />
            </svg>
        ),
    },
];

export default function ShopBenefits() {
    return (
        <section className={cx("benefitsWrapper")}>
            <div className={cx("benefits")}>
                {BENEFITS.map((b, i) => (
                    <div className={cx("benefit")} key={i}>
                        <div className={cx("icon")}>{b.icon}</div>
                        <div>
                            <h5>{b.title}</h5>
                            <p>{b.sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

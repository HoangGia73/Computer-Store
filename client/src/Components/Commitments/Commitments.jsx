import { useState } from "react";
import styles from "./Commitments.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

function AccordionItem({ idx, title, children }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`${open ? "accordionItem open" : "accordionItem"}`}>
            <div className="accordionHeader" onClick={() => setOpen(!open)}>
                <span className="title">{String(idx).padStart(2, "0")}. {title}</span>
                <span className="toggle">{open ? "−" : "+"}</span>
            </div>
            {open && <div className="accordionBody">{children}</div>}
        </div>
    );
}

// ✅ dữ liệu đặt trong file này luôn
const COMMIT_ITEMS = [
    {
        title: "Liên hệ Chăm sóc khách hàng dễ dàng",
        content: (
            <>
                <p>Bạn đang cần hỗ trợ hay đóng góp ý kiến cho PCM trong quá trình mua hàng…</p>
                <p>Hotline CSKH: <b>087.997.9997</b></p>
                <p>
                    Fanpage:{" "}
                    <a href="https://www.facebook.com/pcmarket.vn" target="_blank" rel="noreferrer">
                        facebook.com/pcmarket.vn
                    </a>
                </p>
            </>
        ),
    },
    {
        title: "Giao hàng nhanh trong 2 giờ mà không thu thêm phí",
        content: (<p>Áp dụng nội thành theo khu vực hỗ trợ…</p>),
    },
    {
        title: "Miễn phí lên đời và trải nghiệm sản phẩm trong vòng 15 ngày",
        content: (<p>Đổi sang sản phẩm khác trong 15 ngày nếu còn như mới…</p>),
    },
    {
        title: "Cam kết thu cũ đổi mới trọn đời với tất cả Gaming Gear và linh kiện máy tính",
        content: (<p>Định giá minh bạch theo tình trạng, bù chênh lệch…</p>),
    },
    {
        title: "Cho mượn sản phẩm miễn phí thay thế trong thời gian bảo hành tại PCM",
        content: (<p>Áp dụng với một số nhóm sản phẩm, vui lòng liên hệ CSKH…</p>),
    },
];

export default function Commitments() {
    return (
        <section className={cx("commitWrap")}>
            <div className={cx("commitInner")}>
                <div className={cx("commitHeader")}>
                    <img src="/logo-commit.png" alt="Cam kết" />
                    <h3>
                        Trải nghiệm mua sắm <span>PC Market</span><br />
                        <strong>Cam Kết 100% Hài Lòng</strong>
                    </h3>
                </div>

                <div className={cx("accordion")}>
                    {COMMIT_ITEMS.map((it, i) => (
                        <AccordionItem key={i} idx={i + 1} title={it.title}>
                            {it.content}
                        </AccordionItem>
                    ))}
                </div>
            </div>
        </section>
    );
}
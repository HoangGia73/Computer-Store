import Header from '../../../Components/Header/Header';
import Footer from '../../../Components/Footer/Footer';
import ShopBenefits from "../../../Components/ShopBenefits/ShopBenefits";
import Commitments from '../../../Components/Commitments/Commitments';
import styles from './Address.module.scss';
import classNames from 'classnames/bind';
import { useState } from 'react';

const cx = classNames.bind(styles);

// function AccordionItem({ idx, title, children }) {
//     const [open, setOpen] = useState(false);

//     return (
//         <div className={`${open ? "accordionItem open" : "accordionItem"}`}>
//             <div
//                 className="accordionHeader"
//                 onClick={() => setOpen(!open)}
//             >
//                 <span className="title">
//                     {String(idx).padStart(2, "0")}. {title}
//                 </span>
//                 <span className="toggle">{open ? "−" : "+"}</span>
//             </div>
//             {open && <div className="accordionBody">{children}</div>}
//         </div>
//     );
// }

// // ================= Data cam kết =================
// const COMMIT_ITEMS = [
//     {
//         title: "Liên hệ Chăm sóc khách hàng dễ dàng",
//         content: (
//             <>
//                 <p>
//                     Bạn đang cần hỗ trợ hay cần đóng góp ý kiến cho PCM trong quá trình mua hàng.
//                     Hãy liên hệ với PCM trong bất cứ khi nào 24/07 qua số Hotline hoặc dịch vụ Chat trực tuyến miễn phí.
//                     PCM sẽ cung cấp giải pháp hỗ trợ quý khách các vấn đề liên quan đến sản phẩm mua hàng tại PCM của bạn nhanh nhất có thể.
//                 </p>
//                 <p>
//                     Hotline chăm sóc và hỗ trợ khách mua hàng (chỉ hoạt động trong giờ hành chính):{" "}
//                     <b>087.997.9997</b>
//                 </p>
//                 <p>
//                     Ngoài ra khách hàng có thể liên hệ với PCM thông qua Email, Chat, để lại đánh giá/bình luận ở các kênh mạng xã hội của PCM.
//                 </p>
//                 <p>
//                     Fanpage:{" "}
//                     <a
//                         href="https://www.facebook.com/pcmarket.vn"
//                         target="_blank"
//                         rel="noreferrer"
//                     >
//                         https://www.facebook.com/pcmarket.vn
//                     </a>
//                 </p>
//             </>
//         ),
//     },
//     {
//         title: "Giao hàng nhanh trong 2 giờ mà không thu thêm phí",
//         content: (
//             <>
//                 <p>Áp dụng nội thành theo khu vực hỗ trợ.</p>
//                 <p>
//                     Thời gian giao phụ thuộc tồn kho chi nhánh và khung giờ xác nhận đơn.
//                 </p>
//                 <p>Nhân viên sẽ liên hệ trước khi giao; có thể hẹn khung giờ theo yêu cầu.</p>
//             </>
//         ),
//     },
//     {
//         title: "Miễn phí lên đời và trải nghiệm sản phẩm trong vòng 15 ngày",
//         content: (
//             <>
//                 <p>
//                     Hỗ trợ đổi sang sản phẩm khác có giá trị cao hơn/thấp hơn trong 15 ngày nếu còn nguyên tình trạng như mới.
//                 </p>
//                 <p>Vui lòng mang theo hoá đơn/biên nhận để được phục vụ nhanh chóng.</p>
//             </>
//         ),
//     },
//     {
//         title:
//             "Cam kết thu cũ đổi mới trọn đời với tất cả các sản phẩm Gaming Gear và linh kiện máy tính",
//         content: (
//             <>
//                 <p>
//                     Định giá minh bạch theo tình trạng sản phẩm. Có thể bù chênh lệch để đổi sản phẩm mới.
//                 </p>
//                 <p>
//                     Chi tiết chính sách thu cũ đổi mới cập nhật theo từng thời điểm tại cửa hàng và website.
//                 </p>
//             </>
//         ),
//     },
//     {
//         title:
//             "Cho mượn sản phẩm miễn phí thay thế trong thời gian bảo hành tại PCM",
//         content: (
//             <>
//                 <p>
//                     Áp dụng với một số nhóm sản phẩm phổ biến. Số lượng thiết bị mượn có hạn theo tồn kho hỗ trợ.
//                 </p>
//                 <p>
//                     Vui lòng liên hệ CSKH để được tư vấn trước khi mang sản phẩm đến bảo hành.
//                 </p>
//             </>
//         ),
//     },
// ];


export default function Address() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        content: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.fullName) newErrors.fullName = 'Bạn chưa nhập tên';
        else if (form.fullName.length < 3) newErrors.fullName = 'Tên quá ngắn';

        if (!form.email) newErrors.email = 'Bạn chưa nhập email';
        else {
            const regEmail = /^\w+([-.+']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            if (!regEmail.test(form.email)) newErrors.email = 'Email không hợp lệ';
        }

        if (!form.phone) newErrors.phone = 'Bạn chưa nhập SĐT';
        else {
            const regPhone = /^0\d{9}$/;
            if (!regPhone.test(form.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!form.content) newErrors.content = 'Bạn chưa nhập nội dung';

        return newErrors;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setLoading(true);
            // TODO: gọi API backend
            console.log('Send form data:', form);

            // reset form
            setForm({ fullName: '', email: '', phone: '', content: '' });
            setErrors({});
            alert('Gửi liên hệ thành công!');
        } catch (err) {
            alert('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <Header />

            <main className={cx('container')}>
                <div className={cx('breadcrumb')}>
                    <span>Trang chủ</span>
                    <span className={cx('sep')}>›</span>
                    <span className={cx('current')}>Thông tin liên hệ</span>
                </div>

                <div className={cx('card')}>
                    <div className={cx('grid')}>
                        <div className={cx('colMap')}>
                            <div className={cx('mapWrap')}>
                                <iframe
                                    title="Google Map"
                                    className={cx('map')}
                                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9165.791131902455!2d105.82051!3d21.012192!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135adf3ddfe2f41%3A0x2f69910a2650fb88!2zTcOheSBUw61uaCBQQ00!5e1!3m2!1svi!2sus!4v1758469925850!5m2!1svi!2sus"
                                    style={{ border: 0 }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>

                        <div className={cx('colForm')}>
                            <p className={cx('note')}>
                                Mọi thắc mắc hoặc góp ý, quý khách vui lòng liên hệ trực tiếp với bộ phận chăm sóc khách hàng
                                của chúng tôi bằng cách điền đầy đủ thông tin vào form bên dưới
                            </p>

                            <form onSubmit={onSubmit} className={cx('form')}>
                                <div className={cx('formGroup', errors.fullName && 'hasError')}>
                                    <label>Tên đầy đủ <span>*</span></label>
                                    <input
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={onChange}
                                    // placeholder="Nhập họ tên"
                                    />
                                    {errors.fullName && <p className={cx('errorMsg')}>- {errors.fullName}</p>}
                                </div>

                                <div className={cx('formGroup', errors.email && 'hasError')}>
                                    <label>Email <span>*</span></label>
                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={onChange}
                                    // placeholder="you@example.com"
                                    />
                                    {errors.email && <p className={cx('errorMsg')}>- {errors.email}</p>}
                                </div>

                                <div className={cx('formGroup', errors.phone && 'hasError')}>
                                    <label>Điện thoại <span>*</span></label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={onChange}
                                    // placeholder="0123 456 789"
                                    />
                                    {errors.phone && <p className={cx('errorMsg')}>- {errors.phone}</p>}
                                </div>

                                <div className={cx('formGroup', errors.content && 'hasError')}>
                                    <label>Thông tin liên hệ <span>*</span></label>
                                    <textarea
                                        name="content"
                                        value={form.content}
                                        onChange={onChange}
                                        rows={5}
                                    // placeholder="Bạn cần hỗ trợ vấn đề gì..."
                                    />
                                    {errors.content && <p className={cx('errorMsg')}>- {errors.content}</p>}
                                </div>

                                <button type="submit" className={cx('submit')} disabled={loading}>
                                    {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <ShopBenefits />
            </main>
            <Commitments />
            <Footer />
        </div>
    );
}

import Header from '../../../Components/Header/Header';
import Footer from '../../../Components/Footer/Footer';
import ShopBenefits from "../../../Components/ShopBenefits/ShopBenefits";
import Commitments from '../../../Components/Commitments/Commitments';
import styles from './PCMAbout.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function About() {
  return (
    <div className={cx('wrapper')}>
      <Header />

      <main className={cx("container")}>
        <section className={cx("content")}>
          <h1 className={cx("title")}>GIỚI THIỆU VỀ MÁY TÍNH PCM</h1>
          <p>
            <a href="#" className={cx("brand")}>Máy tính PCM</a> xuất phát điểm là một công ty bán buôn các sản phẩm, linh kiện máy tính. Trải qua chặng đường 10 năm phát triển, PCM đã khẳng định được vị thế của mình và trở thành một trong những nhà bán buôn, bán lẻ các sản phẩm <a href="#">Linh kiện máy tính</a>, <a href="#">PC GAMING</a>, <a href="#">PC LiveStream</a>, <a href="#">PC WorkStation</a>, <a href="#">PC Dựng Phim - Render Video</a>, <a href="#">PC giả lập ảo hóa</a>, <a href="#">PC văn phòng</a> uy tín hàng đầu trên toàn quốc và là đối tác lớn của các tập đoàn công nghệ hàng đầu thế giới như: Intel, Asus, MSI, Asrock, AMD, NVIDIA, Gigabyte, Corsair,...
          </p>

          <p>
            Nhờ nỗ lực phát triển không ngừng, PCM đã đón nhận thêm những thành viên mới, tạo nên một tập thể đoàn kết vững mạnh với đội ngũ 50 nhân viên, có nhiều năm kinh nghiệm làm việc thực tế, am hiểu sâu về hệ thống phần cứng và phần mềm và đặc biệt luôn tận tâm với khách hàng.
          </p>

          <p>
            Với tiêu chí “Hết mình vì khách hàng”, PCM luôn cố gắng để đem đến những sản phẩm chất lượng cùng chế độ dịch vụ tốt nhất đáp ứng mọi nhu cầu của khách hàng. Đó cũng chính là kim chỉ nam mà PCM hướng đến.
          </p>

          <h2 className={cx("heading")}>GIÁ TRỊ CỐT LÕI MÁY TÍNH PCM</h2>
          <p>
            Sự thành công của <strong>PCM</strong> được tạo nên từ các giá trị cốt lõi <strong>Uy tín – Tận Tâm – Trách Nhiệm</strong>
          </p>

          <ul className={cx("bullets")}>
            <li>
              <strong>Uy tín:</strong> PCM cam kết các sản phẩm mà chúng tôi cung cấp đều có nguồn gốc xuất xứ rõ ràng, chính hãng 100% với chế độ bảo hành rõ ràng.
            </li>
            <li>
              <strong>Tận tâm:</strong> PCM luôn lắng nghe nhu cầu của khách hàng để đem lại những sản phẩm, dịch vụ tốt nhất.
            </li>
            <li>
              <strong>Trách Nhiệm:</strong> PCM luôn đặt chữ Tín lên hàng đầu. Mọi vấn đề về sản phẩm đều được xử lý một cách nhanh chóng nhất.
            </li>
          </ul>

          <h2 className={cx("heading")}>CÁC LĨNH VỰC KINH DOANH</h2>
          <p>Các sản phẩm được PCM cung cấp bao gồm:</p>

          <ol className={cx("numbers")}>
            <li>
              Cung cấp các sản phẩm PC GAMING, PC Livestream, PC Workstation, PC dựng phim – Render video, Máy tính đồ hoạ, PC văn phòng và các Linh kiện máy tính.
            </li>
            <li>Thiết kế hệ thống, xây dựng mạng LAN, WAN,… cho các công ty, văn phòng.</li>
            <li>Tư vấn cấu hình theo nhu cầu người dùng &nbsp;–&nbsp; tối ưu ngân sách.</li>
            <li>Các dịch vụ bảo hành, bảo trì.</li>
          </ol>

          <p>
            Với sự cố gắng và nỗ lực không ngừng, PCM đã được tin dùng và trở thành đối tác uy tín và sự tin cậy của khách hàng giúp công ty ngày càng lớn mạnh trong các lĩnh vực hoạt động.
          </p>
          {/* Ảnh minh họa */}
          <div className={cx("imageWrap")}>
            <img
              src="/images/about/pc-showcase.jpg"
              alt="PC trưng bày tại PCM"
              className={cx("image")}
            />
          </div>
          <h2 className={cx("heading")}>KHÁCH HÀNG CỦA PCM</h2>
          <ul className={cx("list")}>
            <li>Khách hàng cá nhân</li>
            <li>Doanh nghiệp nhà nước</li>
            <li>Doanh nghiệp tư nhân vừa và nhỏ</li>
            <li>Tập đoàn lớn</li>
            <li>Tổ chức phi chính phủ</li>
            <li>Trường học, bệnh viện</li>
            <li>Cyber Game</li>
          </ul>
          <h2 className={cx("heading")}>ĐỐI TÁC CHIẾN LƯỢC</h2>
          <div className={cx("partnerImage")}>
            <img
              src="/images/partners/partners-all.png"
              alt="Đối tác chiến lược của PCM"
            />
          </div>
          <h2 className={cx('heading')}>HỆ THỐNG CÁC SHOWROOM CỦA MÁY TÍNH PCM</h2>

          <div className={cx('showroomBlock')}>
            <h4>- SHOWROOM – ĐỐNG ĐA – HÀ NỘI</h4>
            <ul>
              <li>Địa chỉ: 83–85 Thái Hà, Trung Liệt, Đống Đa, Hà Nội</li>
              <li>Hotline: 036.625.8142</li>
            </ul>
          </div>

          <div className={cx('showroomBlock')}>
            <h4>- SHOWROOM QUẬN 10, HỒ CHÍ MINH</h4>
            <ul>
              <li>Địa chỉ: Số 83A Cửu Long, Phường 15, Quận 10, TP Hồ Chí Minh</li>
              <li>Hotline: 087.997.9997</li>
            </ul>
          </div>

          <p className={cx('links')}>
            Website: <a href="https://pcmarket.vn/" target="_blank" rel="noreferrer">https://pcmarket.vn/</a><br />
            Fanpage: <a href="https://www.facebook.com/pcmarket.vn" target="_blank" rel="noreferrer">https://www.facebook.com/pcmarket.vn</a>
          </p>

          <p>
            Chân thành cảm ơn quý khách đã tin tưởng và ủng hộ Máy tính PCM trong suốt thời gian qua
            và luôn sẵn sàng đón chờ sự trở lại của quý khách. Chúng tôi đang tiếp tục hàng ngày, hàng giờ
            cố gắng phát triển để đưa các sản phẩm tốt nhất tới tay các bạn Gamer, Designer, Kiến trúc sư và
            nhà sáng tạo nội dung tại Việt Nam.
          </p>

          <p>Trân trọng cảm ơn và hân hạnh được phục vụ quý khách.</p>
        </section>
      </main>
      <ShopBenefits />
      <Commitments />
      <Footer />
    </div>
  );
}
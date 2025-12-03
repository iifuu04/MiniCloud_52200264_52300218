export interface BlogPost {
    id: number
    title: string
    excerpt: string
    category: string
    image: string
    date: string
    content: string
    author: string
    readTime: string
  }
  
  export const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Các Loại Đám Mây Phổ Biến",
      excerpt: "Tìm hiểu về những loại đám mây khác nhau và cách nhận biết chúng trên bầu trời.",
      category: "Khoa Học",
      image: "/image1.jpg",
      date: "15 Tháng 10, 2025",
      author: "Nguyễn Văn A",
      readTime: "5 phút",
      content: `Đám mây là một phần quan trọng của hệ thống khí hậu của Trái Đất. Chúng được hình thành khi nước bay hơi từ các đại dương, hồ và sông, sau đó ngưng tụ thành những giọt nước nhỏ trong khí quyển.
  
  Có ba loại đám mây chính được phân loại theo độ cao:
  
  **1. Đám Mây Cao (Cirrus)**
  Những đám mây này nằm ở độ cao trên 6,000 mét. Chúng thường có hình dạng mỏng, nhẹ và trắng. Đám mây Cirrus thường báo hiệu sự thay đổi thời tiết trong vòng 24 giờ tới.
  
  **2. Đám Mây Trung Bình (Altocumulus)**
  Nằm ở độ cao từ 2,000 đến 6,000 mét, những đám mây này có hình dạng như những bông bạc hà. Chúng thường xuất hiện vào buổi sáng và có thể báo hiệu mưa bão vào chiều tối.
  
  **3. Đám Mây Thấp (Cumulus)**
  Những đám mây này nằm dưới 2,000 mét và có hình dạng như những bông bạc hà lớn. Chúng thường xuất hiện vào buổi sáng và biến mất vào buổi tối.
  
  Việc hiểu biết về các loại đám mây khác nhau sẽ giúp bạn dự đoán thời tiết và thưởng thức vẻ đẹp của bầu trời.`,
    },
    {
      id: 2,
      title: "Đám Mây và Chu Kỳ Nước",
      excerpt: "Khám phá vai trò quan trọng của đám mây trong chu kỳ nước của Trái Đất.",
      category: "Môi Trường",
      image: "/image2.jpg",
      date: "12 Tháng 10, 2025",
      author: "Trần Thị B",
      readTime: "6 phút",
      content: `Chu kỳ nước là quá trình liên tục mà nước di chuyển giữa các đại dương, khí quyển và đất liền. Đám mây đóng một vai trò trung tâm trong chu kỳ này.
  
  **Các Bước Của Chu Kỳ Nước:**
  
  1. **Bốc Hơi (Evaporation)**: Nước từ các đại dương, hồ và sông bốc hơi do nhiệt từ mặt trời, biến thành hơi nước.
  
  2. **Ngưng Tụ (Condensation)**: Khi hơi nước lên cao vào khí quyển, nó gặp không khí lạnh hơn và ngưng tụ thành những giọt nước nhỏ, tạo thành đám mây.
  
  3. **Mưa (Precipitation)**: Khi những giọt nước trong đám mây trở nên quá nặng, chúng rơi xuống dưới dạng mưa, tuyết hoặc mưa đá.
  
  4. **Chảy Tràn (Runoff)**: Nước mưa chảy xuống các sông, suối và cuối cùng trở lại các đại dương.
  
  Đám mây không chỉ là một phần đẹp của bầu trời mà còn là một phần thiết yếu của hệ thống sống của Trái Đất.`,
    },
    {
      id: 3,
      title: "Nhiếp Ảnh Đám Mây: Mẹo và Thủ Thuật",
      excerpt: "Học cách chụp những bức ảnh đám mây tuyệt đẹp với các mẹo từ các nhiếp ảnh gia chuyên nghiệp.",
      category: "Nhiếp Ảnh",
      image: "/image3.jpg",
      date: "10 Tháng 10, 2025",
      author: "Lê Văn C",
      readTime: "7 phút",
      content: `Chụp ảnh đám mây có thể là một trải nghiệm tuyệt vời nếu bạn biết những mẹo và thủ thuật đúng. Dưới đây là một số lời khuyên từ các nhiếp ảnh gia chuyên nghiệp.
  
  **Mẹo Chụp Ảnh Đám Mây:**
  
  1. **Chọn Thời Gian Đúng**: Ánh sáng vàng vào lúc mặt trời mọc hoặc lặn là lý tưởng nhất. Thời gian này được gọi là "golden hour" và tạo ra những bức ảnh đẹp nhất.
  
  2. **Sử Dụng Bộ Lọc**: Bộ lọc polarizing có thể giúp tăng độ tương phản và làm cho bầu trời xanh hơn.
  
  3. **Thành Phần Hình Ảnh**: Sử dụng quy tắc ba phần để tạo ra những bức ảnh cân bằng và hấp dẫn.
  
  4. **Chọn Vị Trí Tốt**: Tìm một vị trí cao hoặc mở để có cái nhìn rõ ràng về bầu trời.
  
  5. **Thử Nghiệm Với Cài Đặt**: Đừng sợ thử nghiệm với ISO, aperture và shutter speed để tìm ra cài đặt tốt nhất.
  
  Với những mẹo này, bạn sẽ có thể chụp những bức ảnh đám mây tuyệt đẹp.`,
    },
    {
      id: 4,
      title: "Biến Đổi Khí Hậu và Đám Mây",
      excerpt: "Cách biến đổi khí hậu đang thay đổi các mô hình hình thành đám mây trên toàn cầu.",
      category: "Khí Hậu",
      image: "/image1.jpg",
      date: "8 Tháng 10, 2025",
      author: "Phạm Thị D",
      readTime: "8 phút",
      content: `Biến đổi khí hậu đang có tác động sâu sắc đến cách các đám mây hình thành và phát triển trên toàn cầu.
  
  **Những Thay Đổi Quan Sát Được:**
  
  1. **Sự Thay Đổi Trong Mô Hình Đám Mây**: Các nhà khoa học đã quan sát thấy sự thay đổi trong mô hình hình thành đám mây, với một số khu vực có nhiều đám mây hơn trong khi những khu vực khác có ít hơn.
  
  2. **Độ Cao Của Đám Mây**: Các đám mây đang hình thành ở độ cao cao hơn do sự ấm lên của khí quyển.
  
  3. **Thời Gian Tồn Tại**: Một số loại đám mây đang tồn tại lâu hơn do sự thay đổi trong các mô hình gió.
  
  4. **Tác Động Đến Thời Tiết Cực Đoan**: Biến đổi khí hậu đang dẫn đến những cơn bão mạnh hơn và những đợt hạn hán kéo dài hơn.
  
  Hiểu biết về những thay đổi này là rất quan trọng để chuẩn bị cho tương lai.`,
    },
    {
      id: 5,
      title: "Đám Mây Lenticular: Hiện Tượng Thiên Nhiên Kỳ Lạ",
      excerpt: "Khám phá những đám mây hình đĩa bay bí ẩn và cách chúng hình thành.",
      category: "Khoa Học",
      image: "/image2.jpg",
      date: "5 Tháng 10, 2025",
      author: "Nguyễn Văn E",
      readTime: "5 phút",
      content: `Đám mây Lenticular là một trong những hiện tượng thiên nhiên kỳ lạ nhất mà bạn có thể thấy trên bầu trời.
  
  **Đặc Điểm Của Đám Mây Lenticular:**
  
  1. **Hình Dạng**: Những đám mây này có hình dạng giống như một chiếc đĩa bay hoặc một chiếc mũ. Chúng thường có các cạnh sắc nét và một hình dạng rất đối xứng.
  
  2. **Vị Trí**: Chúng thường hình thành ở phía đông của những ngọn núi cao, nơi không khí bị buộc lên trên đỉnh núi.
  
  3. **Sự Hình Thành**: Khi không khí ẩm bị buộc lên trên một ngọn núi, nó lạnh đi và nước ngưng tụ. Khi không khí hạ xuống phía bên kia của núi, nó ấm lên và nước bay hơi. Điều này tạo ra một đám mây có hình dạng rất đặc biệt.
  
  4. **Tại Sao Chúng Trông Giống Như UFO**: Hình dạng kỳ lạ của những đám mây này đã dẫn đến nhiều báo cáo về UFO.
  
  Nếu bạn thấy một đám mây Lenticular, hãy chắc chắn chụp ảnh nó!`,
    },
    {
      id: 6,
      title: "Dự Báo Thời Tiết Bằng Cách Quan Sát Đám Mây",
      excerpt: "Học cách dự đoán thời tiết bằng cách nhìn vào các loại đám mây khác nhau.",
      category: "Khoa Học",
      image: "/image3.jpg",
      date: "1 Tháng 10, 2025",
      author: "Trần Văn F",
      readTime: "6 phút",
      content: `Trước khi có các công cụ dự báo thời tiết hiện đại, mọi người dựa vào quan sát đám mây để dự đoán thời tiết. Bạn cũng có thể làm điều này!
  
  **Cách Dự Đoán Thời Tiết Từ Đám Mây:**
  
  1. **Đám Mây Cirrus**: Nếu bạn thấy những đám mây mỏng, cao này, thời tiết có thể sẽ thay đổi trong vòng 24 giờ tới.
  
  2. **Đám Mây Altocumulus**: Những đám mây này thường xuất hiện vào buổi sáng và có thể báo hiệu mưa bão vào chiều tối.
  
  3. **Đám Mây Cumulonimbus**: Đây là những đám mây bão. Nếu bạn thấy chúng, hãy tìm nơi trú ẩn ngay lập tức!
  
  4. **Bầu Trời Xanh Sáng**: Nếu bầu trời xanh sáng và không có đám mây, thời tiết có thể sẽ tiếp tục tốt.
  
  5. **Sương Mù**: Nếu bạn thấy sương mù vào buổi sáng, thời tiết có thể sẽ ấm lên vào buổi chiều.
  
  Với những kiến thức này, bạn có thể trở thành một nhà dự báo thời tiết tự chế!`,
    },
  ]
  
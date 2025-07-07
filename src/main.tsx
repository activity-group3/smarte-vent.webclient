product: search và optimistic cho inventory.
	khi order diễn ra và callback release khi có lỗi.
promotion: optimistic cho discount khi vừa release, tới lúc có thể nhận check số người đã nhận. khi áp dụng discount và check số lượng đã dùng reserve khi order và callback release nếu lỗi.
order: xử lý transaction và thanh toán flow kết hợp với việc check reserve release trong quá trình payment.
auth: áp dụng keyclock j đó
gateway: có thể áp dụng golang....
chat-bot: dùng python train model AI support sale programs và discounts holding
payment: thực hiện thanh toán có thể thông qua message queue và hoàn thành order nếu ngta chọn thanh toán online
shipping: chứa API để tracking theo trạng thái của order nào đó.

******* scale bằng cách apply regional feature cho các table với mục đích phân vùng
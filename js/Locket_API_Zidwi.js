// Locket_Ohoang7_Zidwi.js
// Kết hợp: Mở khóa gốc (Giữ Video, Premium) + Inject Metadata Photobooth

const url = $request.url;

if (url.includes("api.revenuecat.com")) {
    // [Kế thừa nguyên bản gốc] Xử lý mở khóa Gold
    let body = JSON.parse($response.body);
    body.subscriber.entitlements = {
        "Gold": {
            "expires_date": "2099-12-31T23:59:59Z",
            "product_identifier": "locket_gold_yearly",
            "purchase_date": "2023-01-01T00:00:00Z"
        }
    };
    body.subscriber.subscriptions = {
        "locket_gold_yearly": {
            "billing_issues_detected_at": null,
            "expires_date": "2099-12-31T23:59:59Z",
            "is_sandbox": false,
            "original_purchase_date": "2023-01-01T00:00:00Z",
            "period_type": "normal",
            "purchase_date": "2023-01-01T00:00:00Z",
            "store": "app_store",
            "unsubscribe_detected_at": null
        }
    };
    $done({body: JSON.stringify(body)});
} 
else if (url.includes("api.locketcamera.com/v1/posts")) {
    // [Cập nhật mới] Tiêm Metadata Photobooth
    try {
        let body = JSON.parse($request.body);
        // Server Locket cần flags này để hiện UI khung ảnh ở máy người nhận
        body.is_photobooth = true;
        body.frame_count = 4;
        $done({body: JSON.stringify(body)});
    } catch(e) {
        $done({});
    }
} else {
    $done({});
}

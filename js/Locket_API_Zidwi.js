// Shadowrocket JS - Xử lý Network API (Premium & Metadata)
const url = $request.url;
const method = $request.method;

if (url.indexOf("api.revenuecat.com") != -1) {
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
} else if (url.indexOf("api.locketcamera.com/v1/posts") != -1) {
    // Inject custom metadata cho các bài post dạng Photobooth
    let reqBody = $request.body;
    try {
        let parsed = JSON.parse(reqBody);
        parsed.is_photobooth = true;
        parsed.frame_count = 4; // Cấu hình mặc định 4 frames
        $done({body: JSON.stringify(parsed)});
    } catch(e) {
        $done({});
    }
} else {
    $done({});
}

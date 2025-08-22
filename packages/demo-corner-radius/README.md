# Corner Radius Demo

使用 CSS 變數 `--corner-radius` 動態設定元件的圓角：

演算法：`--corner-radius = min(width, height, userInput)`

特點：

- ResizeObserver 監聽尺寸改變即時更新
- 可編輯文字 (contentEditable)
- 以 Joy UI + sx props 撰寫樣式

啟動：

```bash
pnpm dev
```

輸入框輸入想要的半徑 (px)，實際套用的是寬/高/輸入值三者最小值，確保保持圓形或合理的圓角。

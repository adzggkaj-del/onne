

# Tawk.to 위젯 모바일 위치 조정

## 문제
Tawk.to 채팅 위젯이 모바일 하단 탭바의 "자산" 버튼과 겹침.

## 해결 방안
Tawk.to API의 `Tawk_API.customStyle` 설정을 사용하여 모바일에서 위젯의 위치를 위로 올림. 하단 탭바 높이(약 60px) + 여유분을 고려하여 `bottom` 값을 `70px` 정도로 설정.

## 수정 파일: `src/components/TawkToWidget.tsx`

스크립트 로드 전에 `Tawk_API` 초기화 시 `customStyle` 추가:

```typescript
(window as any).Tawk_API = (window as any).Tawk_API || {};
(window as any).Tawk_API.customStyle = {
  visibility: {
    desktop: { position: 'br', xOffset: 20, yOffset: 20 },
    mobile: { position: 'br', xOffset: 10, yOffset: 70 },
  },
};
```

모바일에서 `yOffset: 70`으로 설정하여 하단 탭바 위에 표시되도록 함. 변경 1개 파일, 3줄 추가.


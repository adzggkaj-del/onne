

# 출금 주문 타입 제약 조건 수정

## 문제
`orders` 테이블의 `orders_type_check` 제약 조건이 `['buy', 'sell', 'lending']`만 허용하고 `'withdraw'`를 허용하지 않음. KRW 출금 시 `type: "withdraw"`로 삽입하여 오류 발생.

## 해결
DB migration으로 기존 check constraint를 삭제하고 `'withdraw'`를 포함한 새 constraint로 교체.

```sql
ALTER TABLE public.orders DROP CONSTRAINT orders_type_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_type_check CHECK (type = ANY (ARRAY['buy', 'sell', 'lending', 'withdraw']));
```

1개 파일 (migration SQL), 코드 변경 없음.


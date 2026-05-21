---
title: Giải thích chi tiết về Spring Transaction
description: Giải thích chi tiết về quản lý transaction trong Spring, bao gồm annotation @Transactional, hành vi truyền transaction, mức độ cô lập, các trường hợp transaction không hoạt động và quy tắc rollback.
category: Framework
tag:
  - Spring
head:
  - - meta
    - name: keywords
      content: Spring事务,@Transactional,事务传播,隔离级别,事务失效,回滚规则,声明式事务,AOP事务
---

Bài phân tích tổng hợp về **Spring Transaction** mà tôi đã hứa với độc giả từ trước cuối cùng cũng ra đây rồi. Phần nội dung này khá quan trọng, dù là để làm việc hay để phỏng vấn, nhưng các tài liệu tham khảo tốt trên mạng lại khá ít.

## Transaction là gì?

**Transaction (giao dịch) là một nhóm các thao tác được xử lý theo logic, hoặc tất cả đều thực thi, hoặc không có thao tác nào được thực thi.**

Chắc chắn mọi người đều có thể đọc thuộc lòng câu trên. Dưới đây tôi sẽ nói về điều này kết hợp với thực tế phát triển hàng ngày.

Mỗi phương thức nghiệp vụ trong hệ thống của chúng ta có thể bao gồm nhiều thao tác database nguyên tử, ví dụ như trong phương thức `savePerson()` dưới đây có hai thao tác database nguyên tử. Những thao tác database nguyên tử này có sự phụ thuộc lẫn nhau, chúng hoặc đều thực thi, hoặc không có gì được thực thi.

```java
  public void savePerson() {
    personDao.save(person);
    personDetailDao.save(personDetail);
  }
```

Ngoài ra, cần đặc biệt chú ý: **Việc transaction có hoạt động hay không, điều then chốt là liệu database engine có hỗ trợ transaction hay không. Ví dụ, MySQL mặc định sử dụng engine `innodb` hỗ trợ transaction. Tuy nhiên, nếu đổi database engine sang `myisam`, thì chương trình cũng sẽ không hỗ trợ transaction nữa!**

Ví dụ kinh điển nhất thường được dùng để minh họa transaction là chuyển khoản ngân hàng. Giả sử Tiểu Minh muốn chuyển 1000 đồng cho Tiểu Hồng, giao dịch chuyển khoản này liên quan đến hai thao tác then chốt:

> 1. Giảm số dư của Tiểu Minh đi 1000 đồng.
> 2. Tăng số dư của Tiểu Hồng lên 1000 đồng.

Nếu giữa hai thao tác này đột ngột xảy ra lỗi như hệ thống ngân hàng bị sập hoặc sự cố mạng, dẫn đến số dư của Tiểu Minh giảm nhưng số dư của Tiểu Hồng không tăng, thì sẽ sai. Transaction đảm bảo rằng hai thao tác then chốt này hoặc đều thành công, hoặc đều thất bại.

![Sơ đồ minh họa transaction](/images/github/javaguide/mysql/%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

```java
public class OrdersService {
  private AccountDao accountDao;

  public void setOrdersDao(AccountDao accountDao) {
    this.accountDao = accountDao;
  }

  @Transactional(propagation = Propagation.REQUIRED,
                isolation = Isolation.DEFAULT, readOnly = false, timeout = -1)
  public void accountMoney() {
    //小红账户多1000
    accountDao.addMoney(1000,xiaohong);
    //模拟突然出现的异常，比如银行中可能为突然停电等等
    //如果没有配置事务管理的话会造成，小红账户多了1000而小明账户没有少钱
    int i = 10 / 0;
    //小王账户少1000
    accountDao.reduceMoney(1000,xiaoming);
  }
}
```

Ngoài ra, bốn đặc tính ACID của database transaction là nền tảng của transaction. Dưới đây hãy cùng tìm hiểu sơ qua về những đặc tính này.

## Bạn có hiểu về các đặc tính (ACID) của Transaction không?

1. **Tính nguyên tử** (`Atomicity`): Transaction là đơn vị thực thi nhỏ nhất, không cho phép phân chia. Tính nguyên tử của transaction đảm bảo rằng hành động hoặc được hoàn thành toàn bộ, hoặc không có tác dụng gì cả;
2. **Tính nhất quán** (`Consistency`): Trước và sau khi thực thi transaction, dữ liệu vẫn nhất quán. Ví dụ trong nghiệp vụ chuyển khoản, dù transaction thành công hay thất bại, tổng số tiền của người chuyển và người nhận phải không thay đổi;
3. **Tính cô lập** (`Isolation`): Khi truy cập database đồng thời, transaction của một người dùng không bị can thiệp bởi các transaction khác, các transaction đồng thời độc lập với nhau trong database;
4. **Tính bền vững** (`Durability`): Sau khi một transaction được commit, những thay đổi của nó đối với dữ liệu trong database là vĩnh viễn, ngay cả khi database gặp sự cố cũng không nên có bất kỳ ảnh hưởng nào đến nó.

🌈 Đây cần bổ sung thêm một điểm: **Chỉ khi đảm bảo được tính bền vững, tính nguyên tử và tính cô lập của transaction, thì tính nhất quán mới có thể được đảm bảo. Tức là D, A, I là phương tiện, C là mục đích!** Chắc chắn mọi người cũng như tôi, đã bị khái niệm ACID này gây hiểu nhầm một thời gian! Tôi cũng chỉ hiểu rõ sau khi xem khóa học công khai của thầy Zhou Zhiming [《Khóa học Kiến trúc Phần mềm của Zhou Zhiming》](https://time.geekbang.org/opencourse/intro/100064201) (Hãy đọc nhiều sách hay hơn!).

![AID->C](/images/github/javaguide/mysql/AID->C.png)

Ngoài ra, tác giả của DDIA tức là [《Designing Data-Intensive Application (Thiết kế Hệ thống Ứng dụng Tập trung Dữ liệu)》](https://book.douban.com/subject/30329536/) đã nói trong cuốn sách của ông:

> Atomicity, isolation, and durability are properties of the database, whereas consis‐ tency (in the ACID sense) is a property of the application. The application may rely on the database's atomicity and isolation properties in order to achieve consistency, but it's not up to the database alone.
>
> Tạm dịch: Tính nguyên tử, tính cô lập và tính bền vững là các thuộc tính của database, trong khi tính nhất quán (theo nghĩa ACID) là thuộc tính của ứng dụng. Ứng dụng có thể dựa vào các thuộc tính nguyên tử và cô lập của database để đạt được tính nhất quán, nhưng điều đó không chỉ phụ thuộc vào database. Vì vậy, chữ C không thuộc về ACID.

Cuốn sách 《Designing Data-Intensive Application (Thiết kế Hệ thống Ứng dụng Tập trung Dữ liệu)》 rất đáng được giới thiệu, xứng đáng được đọc nhiều lần! Trên Douban gần 90% người đọc cuốn sách này đã đánh giá 5 sao. Ngoài ra, bản dịch tiếng Trung đã được mở nguồn trên GitHub, địa chỉ: [https://github.com/Vonng/ddia](https://github.com/Vonng/ddia).

## Bàn chi tiết về hỗ trợ Transaction của Spring

> ⚠️ Nhắc lại một lần nữa: Chương trình của bạn có hỗ trợ transaction hay không, trước tiên phụ thuộc vào database. Ví dụ, nếu dùng MySQL, nếu bạn chọn engine innodb, thì xin chúc mừng, hoàn toàn có thể hỗ trợ transaction. Nhưng nếu MySQL database của bạn sử dụng engine myisam, thì xin lỗi, từ gốc đã không hỗ trợ transaction rồi.

Đây cần nêu thêm một điểm kiến thức rất quan trọng: **MySQL bảo đảm tính nguyên tử như thế nào?**

Chúng ta biết rằng nếu muốn đảm bảo tính nguyên tử của transaction, cần phải **rollback (hoàn tác)** các thao tác đã thực thi khi xảy ra ngoại lệ. Trong MySQL, cơ chế phục hồi được thực hiện thông qua **undo log (nhật ký hoàn tác)**, tất cả các sửa đổi của transaction sẽ được ghi vào undo log này trước rồi mới thực thi các thao tác liên quan. Nếu trong quá trình thực thi gặp ngoại lệ, chúng ta có thể sử dụng trực tiếp thông tin trong **undo log** để khôi phục dữ liệu về trạng thái trước khi sửa đổi! Hơn nữa, undo log sẽ được lưu vào đĩa trước dữ liệu. Điều này đảm bảo rằng ngay cả khi database đột ngột bị tắt, khi người dùng khởi động lại database, database vẫn có thể rollback các transaction chưa hoàn thành trước đó bằng cách truy vấn undo log.

### Spring hỗ trợ hai phương thức quản lý Transaction

#### Quản lý Transaction theo lập trình (Programmatic Transaction Management)

Quản lý transaction thủ công thông qua `TransactionTemplate` hoặc `TransactionManager`. Ít được sử dụng trong ứng dụng thực tế, nhưng hữu ích để bạn hiểu nguyên lý quản lý transaction của Spring.

Ví dụ code sử dụng `TransactionTemplate` để quản lý transaction theo lập trình như sau:

```java
@Autowired
private TransactionTemplate transactionTemplate;
public void testTransaction() {

        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus transactionStatus) {

                try {

                    // ....  业务代码
                } catch (Exception e){
                    //回滚
                    transactionStatus.setRollbackOnly();
                }

            }
        });
}
```

Ví dụ code sử dụng `TransactionManager` để quản lý transaction theo lập trình như sau:

```java
@Autowired
private PlatformTransactionManager transactionManager;

public void testTransaction() {

  TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
          try {
               // ....  业务代码
              transactionManager.commit(status);
          } catch (Exception e) {
              transactionManager.rollback(status);
          }
}
```

#### Quản lý Transaction khai báo (Declarative Transaction Management)

Được khuyến nghị sử dụng (xâm nhập code ít nhất), thực sự được thực hiện thông qua AOP (sử dụng annotation `@Transactional` phổ biến nhất).

Ví dụ code sử dụng annotation `@Transactional` để quản lý transaction như sau:

```java
@Transactional(propagation = Propagation.REQUIRED)
public void aMethod {
  //do something
  B b = new B();
  C c = new C();
  b.bMethod();
  c.cMethod();
}
```

### Giới thiệu về các Interface quản lý Transaction của Spring

Trong framework Spring, ba interface quan trọng nhất liên quan đến quản lý transaction như sau:

- **`PlatformTransactionManager`**: Trình quản lý transaction (của nền tảng), là core của chiến lược transaction Spring.
- **`TransactionDefinition`**: Thông tin định nghĩa transaction (mức độ cô lập transaction, hành vi truyền, timeout, readonly, quy tắc rollback).
- **`TransactionStatus`**: Trạng thái chạy transaction.

Chúng ta có thể xem interface **`PlatformTransactionManager`** như là manager ở tầng trên của transaction, trong khi hai interface **`TransactionDefinition`** và **`TransactionStatus`** có thể được xem là mô tả của transaction.

**`PlatformTransactionManager`** sẽ quản lý transaction dựa trên định nghĩa của **`TransactionDefinition`** như thời gian timeout, mức độ cô lập, hành vi truyền, v.v. Còn interface **`TransactionStatus`** cung cấp một số phương thức để lấy trạng thái tương ứng của transaction như là transaction mới hay không, có thể rollback hay không, v.v.

#### PlatformTransactionManager: Interface quản lý Transaction

**Spring không quản lý transaction trực tiếp, mà cung cấp nhiều loại transaction manager.** Interface của Spring transaction manager là: **`PlatformTransactionManager`**.

Thông qua interface này, Spring cung cấp transaction manager tương ứng cho các nền tảng như: JDBC (`DataSourceTransactionManager`), Hibernate (`HibernateTransactionManager`), JPA (`JpaTransactionManager`), v.v. Nhưng việc triển khai cụ thể là việc của mỗi nền tảng.

**Các triển khai cụ thể của interface `PlatformTransactionManager` như sau:**

![](./images/spring-transaction/PlatformTransactionManager.png)

Interface `PlatformTransactionManager` định nghĩa ba phương thức:

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface PlatformTransactionManager {
    //获得事务
    TransactionStatus getTransaction(@Nullable TransactionDefinition var1) throws TransactionException;
    //提交事务
    void commit(TransactionStatus var1) throws TransactionException;
    //回滚事务
    void rollback(TransactionStatus var1) throws TransactionException;
}

```

**Đây tôi xen vào một câu hỏi. Tại sao cần định nghĩa hoặc trừu tượng hóa interface `PlatformTransactionManager` này?**

Chủ yếu là vì cần trừu tượng hóa hành vi quản lý transaction ra, sau đó các nền tảng khác nhau sẽ triển khai nó. Điều này cho phép chúng ta đảm bảo rằng hành vi cung cấp ra bên ngoài không thay đổi, thuận tiện cho việc mở rộng.

Gần đây tôi đã chia sẻ trên [knowledge planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) của mình: **"Tại sao chúng ta phải dùng interface?"**

> Cuốn sách 《Design Patterns》(của GOF) đã đề cập từ nhiều năm trước rằng nên lập trình dựa trên interface chứ không phải triển khai. Bạn có thực sự biết tại sao phải lập trình dựa trên interface không?
>
> Nhìn vào mã nguồn của các framework và dự án mã nguồn mở, interface là thành phần quan trọng không thể thiếu của chúng. Để hiểu tại sao phải dùng interface, trước tiên cần hiểu interface cung cấp chức năng gì. Chúng ta có thể hiểu interface như một giao ước cung cấp danh sách các chức năng. Interface bản thân không cung cấp chức năng, nó chỉ định nghĩa hành vi. Nhưng ai muốn dùng thì phải triển khai nó trước, tuân theo giao ước của nó, rồi mới tự triển khai các chức năng mà nó định nghĩa cần triển khai.
>
> Ví dụ, dự án trước của tôi có nhu cầu gửi SMS. Vì vậy, chúng tôi đã định nghĩa một interface, interface này chỉ có hai phương thức:
>
> 1. Gửi SMS 2. Phương thức xử lý kết quả gửi.
>
> Ban đầu chúng tôi dùng Alibaba Cloud SMS service, sau đó chúng tôi triển khai interface này để hoàn thành một dịch vụ SMS Alibaba Cloud. Sau đó, chúng tôi đột ngột chuyển sang nền tảng SMS khác. Lúc này chúng tôi chỉ cần triển khai interface này nữa là được. Điều này đảm bảo hành vi cung cấp ra bên ngoài của chúng tôi không thay đổi. Gần như không cần thay đổi bất kỳ code nào, chúng tôi đã hoàn thành sự chuyển đổi yêu cầu một cách dễ dàng, cải thiện tính linh hoạt và khả năng mở rộng của code.
>
> Khi nào dùng interface? Khi module chức năng bạn muốn triển khai liên quan đến hành vi trừu tượng, chẳng hạn như dịch vụ gửi SMS, dịch vụ lưu trữ ảnh, v.v.

#### TransactionDefinition: Thuộc tính Transaction

Interface transaction manager **`PlatformTransactionManager`** lấy một transaction thông qua phương thức **`getTransaction(TransactionDefinition definition)`**, tham số trong phương thức này là lớp **`TransactionDefinition`**, lớp này định nghĩa một số thuộc tính transaction cơ bản.

**Thuộc tính transaction là gì?** Thuộc tính transaction có thể được hiểu là một số cấu hình cơ bản của transaction, mô tả cách chiến lược transaction được áp dụng lên phương thức.

Thuộc tính transaction bao gồm 5 phương diện:

- Mức độ cô lập
- Hành vi truyền
- Quy tắc rollback
- Chỉ đọc hay không
- Timeout transaction

Interface `TransactionDefinition` định nghĩa 5 phương thức và một số hằng số biểu thị thuộc tính transaction như mức độ cô lập, hành vi truyền, v.v.

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface TransactionDefinition {
    int PROPAGATION_REQUIRED = 0;
    int PROPAGATION_SUPPORTS = 1;
    int PROPAGATION_MANDATORY = 2;
    int PROPAGATION_REQUIRES_NEW = 3;
    int PROPAGATION_NOT_SUPPORTED = 4;
    int PROPAGATION_NEVER = 5;
    int PROPAGATION_NESTED = 6;
    int ISOLATION_DEFAULT = -1;
    int ISOLATION_READ_UNCOMMITTED = 1;
    int ISOLATION_READ_COMMITTED = 2;
    int ISOLATION_REPEATABLE_READ = 4;
    int ISOLATION_SERIALIZABLE = 8;
    int TIMEOUT_DEFAULT = -1;
    // 返回事务的传播行为，默认值为 REQUIRED。
    int getPropagationBehavior();
    //返回事务的隔离级别，默认值是 DEFAULT
    int getIsolationLevel();
    // 返回事务的超时时间，默认值为-1。如果超过该时间限制但事务还没有完成，则自动回滚事务。
    int getTimeout();
    // 返回是否为只读事务，默认值为 false
    boolean isReadOnly();

    @Nullable
    String getName();
}
```

#### TransactionStatus: Trạng thái Transaction

Interface `TransactionStatus` được dùng để ghi lại trạng thái của transaction. Interface này định nghĩa một nhóm phương thức để lấy hoặc kiểm tra thông tin trạng thái tương ứng của transaction.

Phương thức `PlatformTransactionManager.getTransaction(…)` trả về một đối tượng `TransactionStatus`.

**Nội dung interface TransactionStatus như sau:**

```java
public interface TransactionStatus{
    boolean isNewTransaction(); // 是否是新的事务
    boolean hasSavepoint(); // 是否有恢复点
    void setRollbackOnly();  // 设置为只回滚
    boolean isRollbackOnly(); // 是否为只回滚
    boolean isCompleted; // 是否已完成
}
```

### Giải thích chi tiết về thuộc tính Transaction

Trong phát triển nghiệp vụ thực tế, mọi người thường dùng annotation `@Transactional` để bật transaction, nhiều người không rõ các tham số trong annotation này có ý nghĩa gì, có tác dụng gì. Để sử dụng quản lý transaction tốt hơn trong dự án, tôi đặc biệt khuyên bạn đọc kỹ nội dung dưới đây.

#### Hành vi truyền Transaction (Transaction Propagation Behavior)

**Hành vi truyền transaction được thiết kế để giải quyết vấn đề transaction giữa các phương thức lớp nghiệp vụ gọi lẫn nhau**.

Khi một phương thức transaction bị gọi bởi một phương thức transaction khác, phải chỉ định cách transaction nên được truyền. Ví dụ: phương thức có thể tiếp tục chạy trong transaction hiện tại, hoặc có thể mở một transaction mới và chạy trong transaction của riêng nó.

Ví dụ: Chúng ta gọi phương thức `bMethod()` của lớp B trong phương thức `aMethod()` của lớp A. Lúc này sẽ liên quan đến vấn đề transaction giữa các phương thức lớp nghiệp vụ gọi lẫn nhau. Nếu `bMethod()` xảy ra ngoại lệ cần rollback, làm thế nào để cấu hình hành vi truyền transaction để `aMethod()` cũng rollback theo? Đây là lúc cần kiến thức về hành vi truyền transaction. Nếu bạn không biết thì nhất định phải đọc kỹ.

```java
@Service
Class A {
    @Autowired
    B b;
    @Transactional(propagation = Propagation.xxx)
    public void aMethod {
        //do something
        b.bMethod();
    }
}

@Service
Class B {
    @Transactional(propagation = Propagation.xxx)
    public void bMethod {
       //do something
    }
}
```

Trong `TransactionDefinition` định nghĩa bao gồm một số hằng số biểu thị hành vi truyền như sau:

```java
public interface TransactionDefinition {
    int PROPAGATION_REQUIRED = 0;
    int PROPAGATION_SUPPORTS = 1;
    int PROPAGATION_MANDATORY = 2;
    int PROPAGATION_REQUIRES_NEW = 3;
    int PROPAGATION_NOT_SUPPORTED = 4;
    int PROPAGATION_NEVER = 5;
    int PROPAGATION_NESTED = 6;
    ......
}
```

Tuy nhiên, để thuận tiện sử dụng, Spring cũng đã định nghĩa tương ứng một class enum: `Propagation`

```java
package org.springframework.transaction.annotation;

import org.springframework.transaction.TransactionDefinition;

public enum Propagation {

    REQUIRED(TransactionDefinition.PROPAGATION_REQUIRED),

    SUPPORTS(TransactionDefinition.PROPAGATION_SUPPORTS),

    MANDATORY(TransactionDefinition.PROPAGATION_MANDATORY),

    REQUIRES_NEW(TransactionDefinition.PROPAGATION_REQUIRES_NEW),

    NOT_SUPPORTED(TransactionDefinition.PROPAGATION_NOT_SUPPORTED),

    NEVER(TransactionDefinition.PROPAGATION_NEVER),

    NESTED(TransactionDefinition.PROPAGATION_NESTED);

    private final int value;

    Propagation(int value) {
        this.value = value;
    }

    public int value() {
        return this.value;
    }

}

```

**Các giá trị hành vi truyền transaction đúng đắn như sau**:

**1.`TransactionDefinition.PROPAGATION_REQUIRED`**

Đây là hành vi truyền transaction được sử dụng nhiều nhất, và là hành vi truyền transaction mặc định của annotation `@Transactional` mà chúng ta thường dùng. Nếu hiện tại đã có transaction thì tham gia vào transaction đó; nếu hiện tại không có transaction thì tạo một transaction mới. Tức là:

- Nếu phương thức bên ngoài không mở transaction, phương thức bên trong được đánh dấu `Propagation.REQUIRED` sẽ mở transaction riêng của nó, và các transaction được mở là độc lập, không ảnh hưởng lẫn nhau.
- Nếu phương thức bên ngoài đã mở transaction và được đánh dấu `Propagation.REQUIRED`, thì tất cả các phương thức bên trong được đánh dấu `Propagation.REQUIRED` và phương thức bên ngoài đều thuộc cùng một transaction. Chỉ cần một phương thức rollback, toàn bộ transaction đều rollback.

Ví dụ: Nếu `aMethod()` và `bMethod()` ở trên đều sử dụng hành vi truyền `PROPAGATION_REQUIRED`, cả hai sẽ dùng cùng một transaction. Chỉ cần một trong các phương thức rollback, toàn bộ transaction đều rollback.

```java
@Service
Class A {
    @Autowired
    B b;
    @Transactional(propagation = Propagation.REQUIRED)
    public void aMethod {
        //do something
        b.bMethod();
    }
}
@Service
Class B {
    @Transactional(propagation = Propagation.REQUIRED)
    public void bMethod {
       //do something
    }
}
```

**`2.TransactionDefinition.PROPAGATION_REQUIRES_NEW`**

Tạo một transaction mới. Nếu hiện tại đã có transaction, thì treo transaction hiện tại lại. Tức là dù phương thức bên ngoài có mở transaction hay không, phương thức bên trong được đánh dấu `Propagation.REQUIRES_NEW` sẽ mở transaction riêng của nó, và các transaction được mở là độc lập, không ảnh hưởng lẫn nhau.

Ví dụ: Nếu `bMethod()` ở trên được đánh dấu bằng hành vi truyền transaction `PROPAGATION_REQUIRES_NEW`, và `aMethod` vẫn sử dụng `PROPAGATION_REQUIRED`. Nếu `aMethod()` xảy ra ngoại lệ và rollback, `bMethod()` sẽ không rollback theo vì `bMethod()` đã mở transaction độc lập. Tuy nhiên, nếu `bMethod()` ném ngoại lệ chưa được bắt và ngoại lệ này thỏa mãn quy tắc rollback của transaction, thì `aMethod()` cũng sẽ rollback vì ngoại lệ này đã được cơ chế quản lý transaction của `aMethod()` phát hiện.

```java
@Service
Class A {
    @Autowired
    B b;
    @Transactional(propagation = Propagation.REQUIRED)
    public void aMethod {
        //do something
        b.bMethod();
    }
}

@Service
Class B {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void bMethod {
       //do something
    }
}
```

**3.`TransactionDefinition.PROPAGATION_NESTED`**:

Nếu hiện tại đã có transaction, thì tạo một transaction làm nested transaction (transaction lồng nhau) của transaction hiện tại để thực thi; nếu hiện tại không có transaction, thì thực hiện thao tác tương tự `TransactionDefinition.PROPAGATION_REQUIRED`. Tức là:

- Trong trường hợp phương thức bên ngoài đã mở transaction, mở một transaction mới bên trong làm nested transaction.
- Nếu phương thức bên ngoài không có transaction, mở một transaction riêng biệt, tương tự `PROPAGATION_REQUIRED`.

`TransactionDefinition.PROPAGATION_NESTED` đại diện cho nested transaction theo quan hệ cha-con. Ý tưởng cốt lõi là child transaction không commit độc lập mà phụ thuộc vào parent transaction, chạy trong parent transaction. Khi parent transaction commit, child transaction cũng sẽ commit theo. Tất nhiên, khi parent transaction rollback, child transaction cũng sẽ rollback.

> Điểm khác biệt với `TransactionDefinition.PROPAGATION_REQUIRES_NEW`: `PROPAGATION_REQUIRES_NEW` là transaction độc lập, không phụ thuộc vào transaction bên ngoài, theo quan hệ ngang hàng. Sau khi thực thi xong sẽ commit ngay lập tức, không liên quan đến transaction bên ngoài.

Child transaction cũng có đặc tính riêng, có thể rollback độc lập mà không gây rollback cho parent transaction. Nhưng điều kiện tiên quyết là phải xử lý ngoại lệ của child transaction, tránh ngoại lệ bị parent transaction phát hiện dẫn đến transaction bên ngoài rollback.

Ví dụ:

- Nếu `aMethod()` rollback, thì `bMethod()` là nested transaction cũng sẽ rollback.
- Nếu `bMethod()` rollback, thì `aMethod()` có rollback hay không phụ thuộc vào ngoại lệ của `bMethod()` có được xử lý hay không:

  - Ngoại lệ của `bMethod()` không được xử lý, tức là bên trong `bMethod()` không xử lý ngoại lệ, và `aMethod()` cũng không xử lý ngoại lệ, thì `aMethod()` sẽ nhận thấy ngoại lệ và gây ra rollback toàn bộ.

    ```java
    @Service
    Class A {
        @Autowired
        B b;
        @Transactional(propagation = Propagation.REQUIRED)
        public void aMethod (){
            //do something
            b.bMethod();
        }
    }

    @Service
    Class B {
        @Transactional(propagation = Propagation.NESTED)
        public void bMethod (){
           //do something and throw an exception
        }
    }
    ```

  - `bMethod()` xử lý ngoại lệ hoặc `aMethod()` xử lý ngoại lệ, thì `aMethod()` sẽ không rollback.

    ```java
    @Service
    Class A {
        @Autowired
        B b;
        @Transactional(propagation = Propagation.REQUIRED)
        public void aMethod (){
            //do something
            try {
                b.bMethod();
            } catch (Exception e) {
                System.out.println("方法回滚");
            }
        }
    }

    @Service
    Class B {
        @Transactional(propagation = Propagation.NESTED)
        public void bMethod {
           //do something and throw an exception
        }
    }
    ```

**4.`TransactionDefinition.PROPAGATION_MANDATORY`**

Nếu hiện tại đã có transaction, thì tham gia vào transaction đó; nếu hiện tại không có transaction, thì ném ngoại lệ. (mandatory: bắt buộc)

Loại này ít được sử dụng, không đưa ra ví dụ nữa.

**Nếu cấu hình sai 3 hành vi truyền transaction dưới đây, transaction sẽ không rollback. Ở đây không trình bày ví dụ so sánh vì chúng ít được sử dụng.**

- **`TransactionDefinition.PROPAGATION_SUPPORTS`**: Nếu hiện tại đã có transaction, thì tham gia vào transaction đó; nếu hiện tại không có transaction, thì tiếp tục chạy theo cách phi transaction.
- **`TransactionDefinition.PROPAGATION_NOT_SUPPORTED`**: Chạy theo cách phi transaction. Nếu hiện tại đã có transaction, thì treo transaction hiện tại lại.
- **`TransactionDefinition.PROPAGATION_NEVER`**: Chạy theo cách phi transaction. Nếu hiện tại đã có transaction, thì ném ngoại lệ.

Để biết thêm về nội dung hành vi truyền transaction, hãy đọc bài viết này: [《Khó quá~Người phỏng vấn yêu cầu tôi kết hợp ví dụ để nói về sự hiểu biết của tôi về hành vi truyền transaction trong Spring.》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486668&idx=2&sn=0381e8c836442f46bdc5367170234abb&chksm=cea24307f9d5ca11c96943b3ccfa1fc70dc97dd87d9c540388581f8fe6d805ff548dff5f6b5b&token=1776990505&lang=zh_CN#rd)

#### Mức độ cô lập Transaction (Transaction Isolation Level)

Interface `TransactionDefinition` định nghĩa năm hằng số biểu thị mức độ cô lập:

```java
public interface TransactionDefinition {
    ......
    int ISOLATION_DEFAULT = -1;
    int ISOLATION_READ_UNCOMMITTED = 1;
    int ISOLATION_READ_COMMITTED = 2;
    int ISOLATION_REPEATABLE_READ = 4;
    int ISOLATION_SERIALIZABLE = 8;
    ......
}
```

Cũng giống như hành vi truyền transaction, để thuận tiện sử dụng, Spring cũng định nghĩa một class enum tương ứng: `Isolation`

```java
public enum Isolation {

  DEFAULT(TransactionDefinition.ISOLATION_DEFAULT),

  READ_UNCOMMITTED(TransactionDefinition.ISOLATION_READ_UNCOMMITTED),

  READ_COMMITTED(TransactionDefinition.ISOLATION_READ_COMMITTED),

  REPEATABLE_READ(TransactionDefinition.ISOLATION_REPEATABLE_READ),

  SERIALIZABLE(TransactionDefinition.ISOLATION_SERIALIZABLE);

  private final int value;

  Isolation(int value) {
    this.value = value;
  }

  public int value() {
    return this.value;
  }

}
```

Dưới đây tôi lần lượt giới thiệu từng mức độ cô lập transaction:

- **`TransactionDefinition.ISOLATION_DEFAULT`**: Sử dụng mức độ cô lập mặc định của database backend. MySQL mặc định sử dụng mức độ cô lập `REPEATABLE_READ`, Oracle mặc định sử dụng mức độ cô lập `READ_COMMITTED`.
- **`TransactionDefinition.ISOLATION_READ_UNCOMMITTED`**: Mức độ cô lập thấp nhất. Ít được sử dụng vì nó cho phép đọc dữ liệu chưa được commit, **có thể gây ra dirty read, phantom read hoặc non-repeatable read**
- **`TransactionDefinition.ISOLATION_READ_COMMITTED`**: Cho phép đọc dữ liệu đã được commit bởi các transaction đồng thời. **Có thể ngăn chặn dirty read, nhưng phantom read hoặc non-repeatable read vẫn có thể xảy ra**
- **`TransactionDefinition.ISOLATION_REPEATABLE_READ`**: Kết quả đọc nhiều lần cùng một trường đều nhất quán, trừ khi dữ liệu bị sửa đổi bởi chính transaction đó. **Có thể ngăn chặn dirty read và non-repeatable read, nhưng phantom read vẫn có thể xảy ra.**
- **`TransactionDefinition.ISOLATION_SERIALIZABLE`**: Mức độ cô lập cao nhất, hoàn toàn tuân thủ mức độ cô lập ACID. Tất cả các transaction được thực thi tuần tự từng cái một, do đó các transaction hoàn toàn không thể can thiệp lẫn nhau. Tức là, **mức độ này có thể ngăn chặn dirty read, non-repeatable read và phantom read**. Nhưng điều này sẽ ảnh hưởng nghiêm trọng đến hiệu suất chương trình. Thông thường cũng không sử dụng mức độ này.

Tài liệu liên quan: [Giải thích chi tiết về mức độ cô lập transaction MySQL](https://javaguide.cn/database/mysql/transaction-isolation-level.html).

#### Thuộc tính Timeout Transaction

Timeout transaction là thời gian tối đa cho phép một transaction thực thi. Nếu vượt quá giới hạn thời gian đó mà transaction vẫn chưa hoàn thành, transaction sẽ tự động rollback. Trong `TransactionDefinition`, thời gian timeout được biểu thị bằng giá trị int, đơn vị là giây, giá trị mặc định là -1, điều này có nghĩa là timeout của transaction phụ thuộc vào hệ thống transaction bên dưới hoặc không có timeout.

#### Thuộc tính Chỉ đọc (Readonly) của Transaction

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface TransactionDefinition {
    ......
    // 返回是否为只读事务，默认值为 false
    boolean isReadOnly();

}
```

Đối với các transaction chỉ thực hiện thao tác đọc dữ liệu, có thể chỉ định kiểu transaction là readonly, tức là transaction chỉ đọc. Transaction chỉ đọc không liên quan đến việc sửa đổi dữ liệu, database sẽ cung cấp một số tối ưu hóa, phù hợp để sử dụng trong các phương thức có nhiều thao tác query database.

Nhiều người sẽ thắc mắc, tại sao một thao tác query dữ liệu lại cần bật hỗ trợ transaction?

Lấy innodb của MySQL làm ví dụ, theo mô tả của trang web chính thức [https://dev.mysql.com/doc/refman/5.7/en/innodb-autocommit-commit-rollback.html](https://dev.mysql.com/doc/refman/5.7/en/innodb-autocommit-commit-rollback.html):

> MySQL mặc định bật chế độ `autocommit` cho mỗi kết nối mới được thiết lập. Trong chế độ này, mỗi câu lệnh `sql` gửi đến MySQL server sẽ được xử lý trong một transaction riêng biệt, sau khi thực thi xong sẽ tự động commit transaction và mở một transaction mới.

Tuy nhiên, nếu bạn thêm annotation `Transactional` cho phương thức, tất cả các câu lệnh `sql` của phương thức này sẽ được đặt trong một transaction. Nếu khai báo transaction chỉ đọc, database sẽ tối ưu hóa việc thực thi của nó mà không mang lại các lợi ích khác.

Nếu không thêm `Transactional`, mỗi câu lệnh `sql` sẽ mở một transaction riêng biệt, và nếu dữ liệu bị thay đổi bởi các transaction khác ở giữa, giá trị mới nhất sẽ được đọc theo thời gian thực.

Chia sẻ về thuộc tính chỉ đọc của transaction, giải đáp của người khác:

- Nếu bạn thực thi một câu lệnh query đơn một lần, thì không cần bật hỗ trợ transaction, database mặc định hỗ trợ tính nhất quán đọc trong thời gian thực thi SQL;
- Nếu bạn thực thi nhiều câu lệnh query một lần, ví dụ như query thống kê, query báo cáo. Trong trường hợp này, nhiều câu lệnh query SQL phải đảm bảo tính nhất quán đọc của toàn bộ. Nếu không, sau câu lệnh SQL query trước, trước câu lệnh SQL query sau, dữ liệu bị người dùng khác thay đổi, thì lần query thống kê tổng thể này sẽ xuất hiện trạng thái dữ liệu đọc không nhất quán. Lúc này nên bật hỗ trợ transaction.

#### Quy tắc Rollback Transaction

Những quy tắc này định nghĩa loại ngoại lệ nào sẽ gây ra rollback transaction và loại nào sẽ không. Theo mặc định, transaction chỉ rollback khi gặp runtime exception (subclass của `RuntimeException`). `Error` cũng sẽ gây rollback transaction. Nhưng khi gặp checked exception (exception kiểm tra) thì sẽ không rollback.

![](./images/spring-transaction/roollbackFor.png)

Nếu muốn rollback cho loại exception cụ thể bạn đã định nghĩa, có thể làm như sau:

```java
@Transactional(rollbackFor= MyException.class)
```

### Giải thích chi tiết về cách sử dụng Annotation @Transactional

#### Phạm vi tác dụng của `@Transactional`

1. **Phương thức**: Khuyến nghị sử dụng annotation trên phương thức. Tuy nhiên cần lưu ý: **Annotation này chỉ có thể được áp dụng cho phương thức public, nếu không sẽ không có hiệu lực.**
2. **Lớp**: Nếu annotation này được sử dụng trên lớp, thì annotation sẽ có hiệu lực cho tất cả các phương thức public trong lớp đó.
3. **Interface**: Không khuyến nghị sử dụng trên interface.

#### Các tham số cấu hình thường dùng của `@Transactional`

Mã nguồn annotation `@Transactional` như sau, trong đó bao gồm cấu hình các thuộc tính transaction cơ bản:

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Transactional {

  @AliasFor("transactionManager")
  String value() default "";

  @AliasFor("value")
  String transactionManager() default "";

  Propagation propagation() default Propagation.REQUIRED;

  Isolation isolation() default Isolation.DEFAULT;

  int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;

  boolean readOnly() default false;

  Class<? extends Throwable>[] rollbackFor() default {};

  String[] rollbackForClassName() default {};

  Class<? extends Throwable>[] noRollbackFor() default {};

  String[] noRollbackForClassName() default {};

}
```

**Tổng hợp các tham số cấu hình thường dùng của `@Transactional` (chỉ liệt kê 5 tham số tôi thường dùng):**

| Tên thuộc tính | Mô tả                                                                                                                                                        |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| propagation    | Hành vi truyền transaction, giá trị mặc định là REQUIRED, các giá trị có thể chọn đã được giới thiệu ở trên                                                  |
| isolation      | Mức độ cô lập transaction, giá trị mặc định sử dụng DEFAULT, các giá trị có thể chọn đã được giới thiệu ở trên                                               |
| timeout        | Thời gian timeout của transaction, giá trị mặc định là -1 (không timeout). Nếu vượt quá giới hạn thời gian mà transaction chưa hoàn thành, tự động rollback. |
| readOnly       | Chỉ định transaction có phải là transaction chỉ đọc hay không, giá trị mặc định là false.                                                                    |
| rollbackFor    | Dùng để chỉ định loại exception có thể kích hoạt rollback transaction, và có thể chỉ định nhiều loại exception.                                              |

#### Nguyên lý của annotation transaction `@Transactional`

Đây là câu hỏi có thể được hỏi trong phỏng vấn khi nói về AOP. Nói sơ qua thôi!

Chúng ta biết rằng, **cơ chế hoạt động của `@Transactional` dựa trên AOP. AOP được triển khai bằng dynamic proxy. Nếu đối tượng đích triển khai interface, mặc định sẽ sử dụng dynamic proxy JDK. Nếu đối tượng đích không triển khai interface, sẽ sử dụng CGLIB dynamic proxy.**

🤐 Thêm một câu: phương thức `createAopProxy()` quyết định sử dụng JDK hay Cglib để làm dynamic proxy, mã nguồn như sau:

```java
public class DefaultAopProxyFactory implements AopProxyFactory, Serializable {

  @Override
  public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {
    if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
      Class<?> targetClass = config.getTargetClass();
      if (targetClass == null) {
        throw new AopConfigException("TargetSource cannot determine target class: " +
            "Either an interface or a target is required for proxy creation.");
      }
      if (targetClass.isInterface() || Proxy.isProxyClass(targetClass)) {
        return new JdkDynamicAopProxy(config);
      }
      return new ObjenesisCglibAopProxy(config);
    }
    else {
      return new JdkDynamicAopProxy(config);
    }
  }
  .......
}
```

Nếu một lớp hoặc một phương thức public trong lớp được đánh dấu bằng annotation `@Transactional`, Spring container sẽ tạo một proxy class cho nó khi khởi động. Khi gọi phương thức public được đánh dấu `@Transactional`, thực sự đang gọi phương thức `invoke()` trong lớp `TransactionInterceptor`. Tác dụng của phương thức này là mở transaction trước phương thức đích, rollback transaction khi gặp ngoại lệ trong quá trình thực thi, và commit transaction sau khi phương thức gọi hoàn thành.

> Phương thức `invoke()` trong lớp `TransactionInterceptor` thực chất gọi nội bộ phương thức `invokeWithinTransaction()` của lớp `TransactionAspectSupport`. Do phiên bản Spring mới đã viết lại phần này rất nhiều, và sử dụng nhiều kiến thức về reactive programming, ở đây không liệt kê mã nguồn nữa.

#### Vấn đề self-invocation trong Spring AOP

Khi một phương thức được đánh dấu bằng annotation `@Transactional`, Spring transaction manager chỉ có hiệu lực khi được gọi từ phương thức của lớp khác, và sẽ không có hiệu lực khi gọi nội bộ trong cùng một lớp.

Điều này do cách hoạt động của Spring AOP quyết định. Vì Spring AOP sử dụng dynamic proxy để triển khai quản lý transaction, nó sẽ tạo đối tượng proxy cho các phương thức có annotation `@Transactional` tại runtime, và áp dụng logic transaction trước và sau khi gọi phương thức. Nếu phương thức được gọi từ lớp khác, proxy object của chúng ta sẽ chặn lệnh gọi phương thức và xử lý transaction. Nhưng khi gọi nội bộ trong phương thức khác của cùng một lớp, proxy object của chúng ta không thể chặn lệnh gọi nội bộ này, do đó transaction cũng sẽ không có hiệu lực.

`method1()` trong lớp `MyService` gọi `method2()` sẽ gây ra transaction của `method2()` không có hiệu lực.

```java
@Service
public class MyService {

private void method1() {
     method2();
     //......
}
@Transactional
 public void method2() {
     //......
  }
}
```

Giải pháp là tránh self-invocation trong cùng lớp hoặc sử dụng AspectJ thay thế Spring AOP proxy.

[issue #2091](https://github.com/Snailclimb/JavaGuide/issues/2091) bổ sung thêm một ví dụ:

```java
@Service
public class MyService {

private void method1() {
     ((MyService)AopContext.currentProxy()).method2(); // 先获取该类的代理对象，然后通过代理对象调用method2。
     //......
}
@Transactional
 public void method2() {
     //......
  }
}
```

Code trên thực sự có thể mở transaction khi self-invoking vì sử dụng phương thức `AopContext.currentProxy()` để lấy đối tượng proxy của lớp hiện tại, sau đó gọi `method2()` thông qua proxy object. Điều này tương đương với việc gọi `method2()` từ bên ngoài, vì vậy annotation transaction mới có hiệu lực. Thông thường chúng ta cũng không viết code như vậy, vì vậy có thể bỏ qua ví dụ đặc biệt này.

#### Tổng hợp các lưu ý khi sử dụng `@Transactional`

- Annotation `@Transactional` chỉ có hiệu lực cho phương thức public, không khuyến nghị sử dụng trên interface;
- Tránh gọi phương thức có annotation `@Transactional` trong cùng một lớp vì sẽ gây transaction không có hiệu lực;
- Đặt đúng các thuộc tính `rollbackFor` và `propagation` của `@Transactional`, nếu không transaction có thể rollback thất bại;
- Lớp chứa phương thức được đánh dấu `@Transactional` phải được Spring quản lý, nếu không sẽ không có hiệu lực;
- Database bên dưới phải hỗ trợ cơ chế transaction, nếu không sẽ không có hiệu lực;
- ……

## Tài liệu tham khảo

- [Tổng hợp] Các tham số của @Transactional trong quản lý transaction Spring:[http://www.mobabel.net/spring事务管理中transactional的参数/](http://www.mobabel.net/spring事务管理中transactional的参数/)
- Tài liệu chính thức Spring：[https://docs.spring.io/spring/docs/4.2.x/spring-framework-reference/html/transaction.html](https://docs.spring.io/spring/docs/4.2.x/spring-framework-reference/html/transaction.html)
- 《Spring5 Advanced Programming》
- Nắm vững cách sử dụng @transactional trong Spring: [https://www.ibm.com/developerworks/cn/java/j-master-spring-transactional-use/index.html](https://www.ibm.com/developerworks/cn/java/j-master-spring-transactional-use/index.html)
- Đặc tính truyền transaction Spring：[https://github.com/love-somnus/Spring/wiki/Spring事务的传播特性](https://github.com/love-somnus/Spring/wiki/Spring事务的传播特性)
- [Giải thích chi tiết về hành vi truyền transaction Spring](https://segmentfault.com/a/1190000013341344)：[https://segmentfault.com/a/1190000013341344](https://segmentfault.com/a/1190000013341344)
- Phân tích toàn diện về quản lý transaction theo lập trình và khai báo trong Spring：[https://www.ibm.com/developerworks/cn/education/opensource/os-cn-spring-trans/index.html](https://www.ibm.com/developerworks/cn/education/opensource/os-cn-spring-trans/index.html)

<!-- @include: @article-footer.snippet.md -->

---
title: Tổng hợp các câu hỏi phỏng vấn MyBatis phổ biến
description: Giải thích chi tiết các câu hỏi phỏng vấn MyBatis phổ biến, bao gồm sự khác biệt giữa #{} và ${}, dynamic SQL, cache cấp 1 và cấp 2, plugin phân trang và nguyên lý ánh xạ Mapper.
category: Framework
icon: "database"
tag:
  - MyBatis
head:
  - - meta
    - name: keywords
      content: MyBatis,MyBatis面试题,#{}与${},动态SQL,一级缓存,二级缓存,分页插件,Mapper映射
---

<!-- @include: @small-advertisement.snippet.md -->

> Bài viết này được JavaGuide sưu tầm từ mạng, nguồn gốc ban đầu không rõ.
>
> Thay vì những câu hỏi phỏng vấn khô khan này, tôi khuyên bạn nên xem các bài viết hay về MyBatis được giới thiệu ở cuối bài.

### Sự khác biệt giữa #{} và \${} là gì?

Lưu ý: Câu hỏi này là phỏng vấn viên hỏi đồng nghiệp của tôi.

Trả lời:

- `${}` là placeholder biến trong file Properties, nó có thể dùng cho giá trị thuộc tính tag và bên trong sql, thuộc dạng thay thế văn bản nguyên gốc, có thể thay thế bất kỳ nội dung nào, ví dụ `${driver}` sẽ được thay thế nguyên văn thành `com.mysql.jdbc. Driver`.

Một ví dụ: sắp xếp theo bất kỳ trường nào dựa trên tham số:

```sql
select * from users order by ${orderCols}
```

`orderCols` có thể là `name`, `name desc`, `name,sex asc`, v.v., thực hiện sắp xếp linh hoạt.

- `#{}` là placeholder tham số sql, MyBatis sẽ thay thế `#{}` trong sql thành dấu ?, trước khi thực thi sql sẽ dùng phương thức thiết lập tham số của PreparedStatement để đặt giá trị tham số theo thứ tự cho các placeholder ?, ví dụ ps.setInt(0, parameterValue). Cách lấy giá trị của `#{item.name}` là dùng reflection để lấy giá trị thuộc tính name của đối tượng item từ đối tượng tham số, tương đương với `param.getItem().getName()`.

### Trong file xml mapping, ngoài các tag phổ biến select, insert, update, delete, còn có những tag nào khác?

Lưu ý: Câu hỏi này là phỏng vấn viên JD hỏi tôi.

Trả lời: Còn có nhiều tag khác, `<resultMap>`, `<parameterMap>`, `<sql>`, `<include>`, `<selectKey>`, cộng thêm 9 tag dynamic sql gồm `trim|where|set|foreach|if|choose|when|otherwise|bind`, trong đó `<sql>` là tag sql fragment, được tham chiếu thông qua tag `<include>`, `<selectKey>` là tag chiến lược sinh primary key cho các loại không hỗ trợ auto-increment.

### Nguyên lý hoạt động của Dao interface là gì? Các phương thức trong Dao interface có thể overload khi tham số khác nhau không?

Lưu ý: Câu hỏi này cũng là phỏng vấn viên JD hỏi tôi.

Trả lời: Trong best practice, thường mỗi file xml mapping sẽ có một Dao interface tương ứng. Dao interface chính là `Mapper` interface mà mọi người hay nói, tên đầy đủ của interface chính là giá trị namespace trong file mapping, tên phương thức của interface chính là giá trị id của `MappedStatement` trong file mapping, tham số trong phương thức interface chính là tham số truyền vào sql. `Mapper` interface không có lớp triển khai, khi gọi phương thức interface, tên đầy đủ + tên phương thức ghép lại thành chuỗi làm key, có thể xác định duy nhất một `MappedStatement`. Ví dụ: `com.mybatis3.mappers. StudentDao.findStudentById` có thể xác định duy nhất `MappedStatement` có `id = findStudentById` trong namespace `com.mybatis3.mappers. StudentDao`. Trong MyBatis, mỗi tag `<select>`, `<insert>`, `<update>`, `<delete>` đều được parse thành một đối tượng `MappedStatement`.

~~Các phương thức trong Dao interface không thể overload, vì chiến lược lưu trữ và tìm kiếm là tên đầy đủ + tên phương thức.~~

Các phương thức trong Dao interface có thể overload, nhưng ID trong xml của Mybatis không được phép trùng.

Mybatis phiên bản 3.3.0, đã test như sau:

```java
/**
 * Mapper接口里面方法重载
 */
public interface StuMapper {

 List<Student> getAllStu();

 List<Student> getAllStu(@Param("id") Integer id);
}
```

Sau đó trong `StuMapper.xml` dùng dynamic sql của Mybatis là có thể triển khai được.

```xml
<select id="getAllStu" resultType="com.pojo.Student">
  select * from student
  <where>
    <if test="id != null">
      id = #{id}
    </if>
  </where>
</select>
```

Chạy bình thường và nhận được kết quả tương ứng, như vậy đã triển khai viết phương thức overload trong Dao interface.

**Dao interface của Mybatis có thể có nhiều phương thức overload, nhưng nhiều phương thức phải chỉ tương ứng với một mapping duy nhất, nếu không sẽ báo lỗi khi khởi động.**

Issue liên quan: [Đính chính: Các phương thức trong Dao interface có thể overload, nhưng ID trong xml của Mybatis không được phép trùng!](https://github.com/Snailclimb/JavaGuide/issues/1122)

Nguyên lý hoạt động của Dao interface là JDK dynamic proxy, khi chạy MyBatis sẽ dùng JDK dynamic proxy để tạo đối tượng proxy cho Dao interface, đối tượng proxy sẽ intercept phương thức interface, chuyển sang thực thi sql đại diện bởi `MappedStatement`, sau đó trả về kết quả thực thi sql.

**Bổ sung**:

Phương thức Dao interface có thể overload, nhưng cần thỏa mãn các điều kiện sau:

1. Chỉ có một phương thức không tham số và một phương thức có tham số
2. Khi có nhiều phương thức có tham số, số lượng tham số phải như nhau. Và dùng cùng `@Param`, hoặc dùng dạng `param1`

**Test như sau**:

`PersonDao.java`

```java
Person queryById();

Person queryById(@Param("id") Long id);

Person queryById(@Param("id") Long id, @Param("name") String name);
```

`PersonMapper.xml`

```xml
<select id="queryById" resultMap="PersonMap">
    select
      id, name, age, address
    from person
    <where>
        <if test="id != null">
            id = #{id}
        </if>
        <if test="name != null and name != ''">
            name = #{name}
        </if>
    </where>
    limit 1
</select>
```

Phương thức `org.apache.ibatis.scripting.xmltags. DynamicContext. ContextAccessor#getProperty` dùng để lấy giá trị điều kiện trong tag `<if>`

```java
public Object getProperty(Map context, Object target, Object name) {
  Map map = (Map) target;

  Object result = map.get(name);
  if (map.containsKey(name) || result != null) {
    return result;
  }

  Object parameterObject = map.get(PARAMETER_OBJECT_KEY);
  if (parameterObject instanceof Map) {
    return ((Map)parameterObject).get(name);
  }

  return null;
}
```

`parameterObject` là map, lưu trữ thông tin liên quan đến tham số trong Dao interface.

Phương thức `((Map)parameterObject).get(name)` như sau

```java
public V get(Object key) {
  if (!super.containsKey(key)) {
    throw new BindingException("Parameter '" + key + "' not found. Available parameters are " + keySet());
  }
  return super.get(key);
}
```

1. Khi phương thức `queryById()` được thực thi, `parameterObject` là null, phương thức `getProperty` trả về null, tất cả giá trị điều kiện lấy được từ tag `<if>` đều là null, tất cả điều kiện không thỏa mãn, dynamic sql có thể thực thi bình thường.
2. Khi phương thức `queryById(1L)` được thực thi, `parameterObject` là map, chứa hai key `id` và `param1`. Khi lấy giá trị thuộc tính `name` trong tag `<if>`, vào phương thức `((Map)parameterObject).get(name)`, map không chứa key `name`, nên ném exception.
3. Khi phương thức `queryById(1L,"1")` được thực thi, `parameterObject` chứa bốn key `id`, `param1`, `name`, `param2`, cả thuộc tính `id` và `name` đều có thể lấy được, dynamic sql thực thi bình thường.

### MyBatis thực hiện phân trang như thế nào? Nguyên lý của plugin phân trang là gì?

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: **(1)** MyBatis dùng đối tượng RowBounds để phân trang, đây là phân trang trong bộ nhớ được thực thi trên tập kết quả ResultSet, không phải phân trang vật lý; **(2)** Có thể viết trực tiếp tham số phân trang vật lý trong sql để hoàn thành chức năng phân trang vật lý; **(3)** Cũng có thể dùng plugin phân trang để hoàn thành phân trang vật lý.

Nguyên lý cơ bản của plugin phân trang là dùng interface plugin do MyBatis cung cấp, triển khai plugin tùy chỉnh, trong phương thức interceptor của plugin, chặn sql cần thực thi, sau đó viết lại sql, thêm câu lệnh phân trang vật lý và tham số phân trang vật lý tương ứng dựa trên dialect.

Ví dụ: `select _ from student`, sau khi chặn sql, viết lại thành: `select t._ from (select \* from student) t limit 0，10`

### Trình bày ngắn gọn nguyên lý hoạt động của plugin MyBatis và cách viết một plugin

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: MyBatis chỉ có thể viết plugin cho 4 loại interface là `ParameterHandler`, `ResultSetHandler`, `StatementHandler`, `Executor`. MyBatis dùng JDK dynamic proxy để tạo đối tượng proxy cho interface cần interceptor nhằm triển khai chức năng interceptor phương thức interface. Mỗi khi phương thức của 4 loại đối tượng interface này được thực thi, sẽ vào phương thức interceptor, cụ thể là phương thức `invoke()` của `InvocationHandler`. Tất nhiên, chỉ interceptor những phương thức mà bạn chỉ định cần interceptor.

Triển khai interface `Interceptor` của MyBatis và override phương thức `intercept()`, sau đó viết annotation cho plugin chỉ định cần interceptor phương thức nào của interface nào là được. Nhớ đừng quên cấu hình plugin bạn đã viết trong file cấu hình.

### Khi MyBatis thực hiện batch insert, có thể trả về danh sách primary key từ cơ sở dữ liệu không?

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: Được, JDBC có thể thì MyBatis tất nhiên cũng có thể.

### Dynamic sql trong MyBatis dùng để làm gì? Có những loại dynamic sql nào? Có thể trình bày ngắn gọn nguyên lý thực thi của dynamic sql không?

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: Dynamic sql của MyBatis cho phép chúng ta viết dynamic sql dưới dạng tag trong file xml mapping, hoàn thành chức năng phán đoán logic và ghép nối sql động. Nguyên lý thực thi của nó là dùng OGNL để tính giá trị biểu thức từ đối tượng tham số sql, dựa trên giá trị biểu thức để ghép nối sql động, từ đó hoàn thành chức năng dynamic sql.

MyBatis cung cấp 9 loại tag dynamic sql:

- `<if></if>`
- `<where></where>(trim,set)`
- `<choose></choose>（when, otherwise）`
- `<foreach></foreach>`
- `<bind/>`

Để biết thêm chi tiết về MyBatis dynamic SQL, vui lòng xem bài viết này: [Mybatis series toàn giải (Phần 8): Bạn biết bao nhiêu trong 9 tag dynamic SQL của Mybatis?](https://segmentfault.com/a/1190000039335704)

Để biết cách sử dụng cụ thể của các dynamic SQL này, vui lòng xem bài viết này: [Mybatis【13】-- Cách sử dụng các tag dynamic SQL của Mybatis?](https://cloud.tencent.com/developer/article/1943349)

### MyBatis đóng gói kết quả thực thi sql thành đối tượng mục tiêu và trả về như thế nào? Có những hình thức ánh xạ nào?

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: Cách thứ nhất là dùng tag `<resultMap>`, định nghĩa từng mối quan hệ ánh xạ giữa tên cột và tên thuộc tính đối tượng. Cách thứ hai là dùng chức năng alias của cột sql, viết alias cột thành tên thuộc tính đối tượng, ví dụ T_NAME AS NAME. Tên thuộc tính đối tượng thường là name viết thường, nhưng tên cột không phân biệt hoa thường, MyBatis sẽ bỏ qua case của tên cột, thông minh tìm tên thuộc tính đối tượng tương ứng, bạn thậm chí có thể viết là T_NAME AS NaMe, MyBatis vẫn hoạt động bình thường.

Sau khi có mối quan hệ ánh xạ giữa tên cột và tên thuộc tính, MyBatis tạo đối tượng thông qua reflection, đồng thời dùng reflection gán giá trị từng thuộc tính của đối tượng và trả về. Những thuộc tính không tìm được mối quan hệ ánh xạ sẽ không thể gán giá trị.

### MyBatis có thể thực hiện truy vấn liên kết một-một, một-nhiều không? Có những cách triển khai nào và sự khác biệt giữa chúng là gì?

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: Được, MyBatis không chỉ có thể thực hiện truy vấn liên kết một-một, một-nhiều, mà còn có thể thực hiện nhiều-một, nhiều-nhiều. Truy vấn nhiều-một thực ra chính là truy vấn một-một, chỉ cần đổi `selectOne()` thành `selectList()`; truy vấn nhiều-nhiều thực ra chính là truy vấn một-nhiều, chỉ cần đổi `selectOne()` thành `selectList()`.

Truy vấn đối tượng liên kết có hai cách triển khai, một là gửi riêng một sql để truy vấn đối tượng liên kết rồi gán cho đối tượng chính, sau đó trả về đối tượng chính. Cách kia là dùng truy vấn lồng nhau, ý nghĩa của truy vấn lồng nhau là dùng join query, một phần cột là giá trị thuộc tính của đối tượng A, phần còn lại là giá trị thuộc tính của đối tượng liên kết B, ưu điểm là chỉ gửi một sql query là có thể lấy được cả đối tượng chính lẫn đối tượng liên kết.

Vậy câu hỏi đặt ra, join query lấy ra 100 bản ghi, làm thế nào để xác định đối tượng chính là 5 cái chứ không phải 100 cái? Nguyên lý loại trùng lặp là tag con `<id>` trong tag `<resultMap>`, chỉ định cột id xác định duy nhất một bản ghi, MyBatis dùng giá trị cột `<id>` để thực hiện chức năng loại trùng lặp 100 bản ghi. `<id>` có thể có nhiều cái, đại diện cho ý nghĩa của composite primary key.

Tương tự, đối tượng liên kết của đối tượng chính cũng loại trùng lặp theo nguyên lý này, mặc dù trong trường hợp thông thường, chỉ đối tượng chính mới có bản ghi trùng lặp, đối tượng liên kết thường không bị trùng.

Ví dụ: join query bên dưới lấy ra 6 bản ghi, cột một và hai là cột của đối tượng Teacher, cột ba là cột của đối tượng Student, sau khi MyBatis xử lý loại trùng lặp, kết quả là 1 giáo viên 6 học sinh, chứ không phải 6 giáo viên 6 học sinh.

| t_id | t_name  | s_id |
| ---- | ------- | ---- |
| 1    | teacher | 38   |
| 1    | teacher | 39   |
| 1    | teacher | 40   |
| 1    | teacher | 41   |
| 1    | teacher | 42   |
| 1    | teacher | 43   |

### MyBatis có hỗ trợ lazy loading không? Nếu có, nguyên lý triển khai của nó là gì?

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: MyBatis chỉ hỗ trợ lazy loading cho đối tượng liên kết association và đối tượng collection liên kết, association là quan hệ một-một, collection là truy vấn một-nhiều. Trong file cấu hình MyBatis, có thể cấu hình có bật lazy loading không: `lazyLoadingEnabled=true|false`.

Nguyên lý của nó là dùng `CGLIB` tạo đối tượng proxy của đối tượng mục tiêu, khi gọi phương thức mục tiêu, vào phương thức interceptor. Ví dụ khi gọi `a.getB().getName()`, phương thức `invoke()` của interceptor phát hiện `a.getB()` là giá trị null, khi đó sẽ gửi riêng câu sql truy vấn đối tượng liên kết B đã được lưu sẵn, truy vấn B lên, sau đó gọi `a.setB(b)`, như vậy thuộc tính b của đối tượng a đã có giá trị, tiếp theo hoàn thành lời gọi phương thức `a.getB().getName()`. Đây là nguyên lý cơ bản của lazy loading.

Tất nhiên, không chỉ MyBatis, hầu như tất cả các framework hỗ trợ lazy loading kể cả Hibernate đều có nguyên lý giống nhau.

### Trong các file xml mapping khác nhau của MyBatis, id có được phép trùng không?

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: Ở các file xml mapping khác nhau, nếu đã cấu hình namespace thì id có thể trùng; nếu không cấu hình namespace thì id không thể trùng. Dù sao namespace cũng không bắt buộc, chỉ là best practice mà thôi.

Nguyên nhân là namespace+id được dùng làm key của `Map<String, MappedStatement>`, nếu không có namespace, chỉ còn id, thì id trùng sẽ dẫn đến dữ liệu ghi đè lên nhau. Khi có namespace, tất nhiên id có thể trùng, namespace khác nhau thì namespace+id tự nhiên cũng khác nhau.

### Làm thế nào để thực hiện batch processing trong MyBatis?

Lưu ý: Tôi tự đặt ra câu hỏi này.

Trả lời: Dùng `BatchExecutor` để hoàn thành batch processing.

### MyBatis có những loại Executor nào? Sự khác biệt giữa chúng là gì?

Lưu ý: Tôi tự đặt ra câu hỏi này

Trả lời: MyBatis có ba loại `Executor` cơ bản:

- **`SimpleExecutor`:** Mỗi lần thực thi update hoặc select sẽ mở một đối tượng Statement, dùng xong đóng ngay đối tượng Statement.
- **`ReuseExecutor`:** Thực thi update hoặc select, dùng sql làm key để tìm đối tượng Statement, nếu tồn tại thì dùng, không tồn tại thì tạo mới, sau khi dùng xong, không đóng đối tượng Statement mà đặt vào `Map<String, Statement>` để dùng lần tiếp theo. Nói ngắn gọn là tái sử dụng đối tượng Statement.
- **`BatchExecutor`**: Thực thi update (không có select, JDBC batch processing không hỗ trợ select), thêm tất cả sql vào batch processing (`addBatch()`), chờ thực thi đồng loạt (`executeBatch()`), nó cache nhiều đối tượng Statement, mỗi đối tượng Statement sau khi `addBatch()` xong, chờ thực thi `executeBatch()` từng cái. Giống với JDBC batch processing.

Phạm vi tác dụng: Những đặc điểm này của `Executor` đều bị giới hạn nghiêm ngặt trong phạm vi vòng đời SqlSession.

### Làm thế nào để chỉ định dùng loại Executor nào trong MyBatis?

Lưu ý: Tôi tự đặt ra câu hỏi này

Trả lời: Trong file cấu hình MyBatis, có thể chỉ định loại `ExecutorType` mặc định, cũng có thể truyền tham số kiểu `ExecutorType` thủ công vào phương thức tạo SqlSession của `DefaultSqlSessionFactory`.

### MyBatis có thể ánh xạ enum Enum không?

Lưu ý: Tôi tự đặt ra câu hỏi này

Trả lời: MyBatis có thể ánh xạ enum class, không chỉ enum class, MyBatis có thể ánh xạ bất kỳ đối tượng nào vào một cột của bảng. Cách ánh xạ là tự định nghĩa một `TypeHandler`, triển khai các phương thức interface `setParameter()` và `getResult()` của `TypeHandler`. `TypeHandler` có hai tác dụng:

- Một là hoàn thành chuyển đổi từ javaType sang jdbcType;
- Hai là hoàn thành chuyển đổi từ jdbcType sang javaType, thể hiện qua hai phương thức `setParameter()` và `getResult()`, đại diện lần lượt cho việc đặt tham số placeholder dấu ? trong sql và lấy kết quả truy vấn cột.

### Trong file mapping xml của MyBatis, nếu tag A tham chiếu nội dung của tag B thông qua include, vậy tag B có thể định nghĩa sau tag A không, hay phải định nghĩa trước tag A?

Lưu ý: Tôi tự đặt ra câu hỏi này

Trả lời: Mặc dù MyBatis parse file xml mapping theo thứ tự, nhưng tag B được tham chiếu vẫn có thể định nghĩa ở bất kỳ đâu, MyBatis đều có thể nhận diện đúng.

Nguyên lý là, MyBatis parse tag A, phát hiện tag A tham chiếu tag B, nhưng tag B chưa được parse, chưa tồn tại. Khi đó MyBatis sẽ đánh dấu tag A là trạng thái chưa parse, sau đó tiếp tục parse các tag còn lại bao gồm tag B. Khi tất cả tag đã parse xong, MyBatis sẽ parse lại những tag được đánh dấu là chưa parse. Lúc này khi parse tag A, tag B đã tồn tại, tag A cũng có thể parse hoàn thành bình thường.

### Trình bày ngắn gọn mối quan hệ ánh xạ giữa file xml mapping của MyBatis và cấu trúc dữ liệu nội bộ của MyBatis?

Lưu ý: Tôi tự đặt ra câu hỏi này

Trả lời: MyBatis đóng gói tất cả thông tin cấu hình xml vào đối tượng hạng nặng All-In-One là Configuration. Trong file xml mapping, tag `<parameterMap>` sẽ được parse thành đối tượng `ParameterMap`, mỗi phần tử con của nó sẽ được parse thành đối tượng ParameterMapping. Tag `<resultMap>` sẽ được parse thành đối tượng `ResultMap`, mỗi phần tử con của nó sẽ được parse thành đối tượng `ResultMapping`. Mỗi tag `<select>`, `<insert>`, `<update>`, `<delete>` đều sẽ được parse thành đối tượng `MappedStatement`, sql trong tag sẽ được parse thành đối tượng BoundSql.

### Tại sao MyBatis được gọi là công cụ ORM mapping bán tự động? Sự khác biệt của nó với loại hoàn toàn tự động là gì?

Lưu ý: Tôi tự đặt ra câu hỏi này

Trả lời: Hibernate thuộc công cụ ORM mapping hoàn toàn tự động, khi dùng Hibernate để truy vấn đối tượng liên kết hoặc đối tượng collection liên kết, có thể lấy trực tiếp dựa trên mô hình quan hệ đối tượng, vì vậy nó là hoàn toàn tự động. Còn MyBatis khi truy vấn đối tượng liên kết hoặc đối tượng collection liên kết, cần viết sql thủ công để hoàn thành, vì vậy được gọi là công cụ ORM mapping bán tự động.

Các câu hỏi phỏng vấn có vẻ đơn giản, nhưng để có thể trả lời đúng, chắc chắn phải là người đã nghiên cứu mã nguồn sâu sắc, chứ không chỉ là người biết dùng hoặc dùng thành thạo. Tất cả các câu hỏi phỏng vấn và câu trả lời ở trên đều có giải thích chi tiết và phân tích nguyên lý trong các blog series MyBatis của tôi.

<!-- @include: @article-footer.snippet.md -->

### Bài viết được đề xuất

- [Phân tích toàn diện 9 design pattern trong Mybatis (2W chữ)](https://juejin.cn/post/7273516671574687759)
- [Tự xây dựng một plugin mã hóa/giải mã MyBatis từ đầu](https://mp.weixin.qq.com/s/WUEAdFDwZsZ4EKO8ix0ijg)
- [Hướng dẫn sử dụng MyBatis đầy đủ nhất](https://juejin.cn/post/7051910683264286750)
- [Mở mang tư duy! Lần đầu thấy cách dùng MyBatis như vậy, khiến tôi bất ngờ không thôi.](https://juejin.cn/post/7269390456530190376)
- [MyBatis cũng có vấn đề đồng thời](https://juejin.cn/post/7264921613551730722)

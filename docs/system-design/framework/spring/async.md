---
title: Phân tích nguyên lý annotation @Async
description: Giải thích chi tiết nguyên lý annotation bất đồng bộ @Async của Spring, bao gồm cấu hình tác vụ bất đồng bộ, cài đặt thread pool, cơ chế @EnableAsync và các vấn đề thường gặp khi sử dụng.
category: Framework
tag:
  - Spring
head:
  - - meta
    - name: keywords
      content: Spring异步,@Async,EnableAsync,线程池,TaskExecutor,异步任务,Spring注解,方法异步
---

Annotation `@Async` được cung cấp bởi Spring framework. Các lớp hoặc phương thức được đánh dấu bởi annotation này sẽ được thực thi trong **luồng bất đồng bộ**. Điều này có nghĩa là khi phương thức được gọi, người gọi sẽ không chờ phương thức đó thực thi xong, mà có thể tiếp tục thực thi code tiếp theo.

Việc sử dụng annotation `@Async` rất đơn giản, cần hai bước:

1. Thêm annotation `@EnableAsync` vào lớp khởi động để bật tính năng tác vụ bất đồng bộ.
2. Thêm annotation `@Async` vào phương thức hoặc lớp cần thực thi bất đồng bộ.

```java
@SpringBootApplication
// 开启异步任务
@EnableAsync
public class YourApplication {

    public static void main(String[] args) {
        SpringApplication.run(YourApplication.class, args);
    }
}

// 异步服务类
@Service
public class MyService {

    // 推荐使用自定义线程池，这里只是演示基本用法
    @Async
    public CompletableFuture<String> doSomethingAsync() {

        // 这里会有一些业务耗时操作
        // ...
        // 使用 CompletableFuture 可以更方便地处理异步任务的结果，避免阻塞主线程
        return CompletableFuture.completedFuture("Async Task Completed");
    }

}
```

Tiếp theo, hãy cùng tìm hiểu nguyên lý nền tảng của `@Async`.

## Phân tích nguyên lý @Async

`@Async` có thể thực thi tác vụ bất đồng bộ, về bản chất là sử dụng **dynamic proxy (proxy động)**. Spring sử dụng `BeanPostProcessor` (bộ xử lý hậu kỳ) để tạo dynamic proxy cho các lớp sử dụng annotation `@Async`. Sau đó, các lời gọi phương thức được đánh dấu `@Async` sẽ bị dynamic proxy chặn lại. Trong interceptor, việc thực thi phương thức được đóng gói thành tác vụ bất đồng bộ và giao cho thread pool xử lý.

Tiếp theo, hãy phân tích chi tiết.

### Bật bất đồng bộ

Trước khi sử dụng `@Async`, cần thêm `@EnableAsync` vào lớp khởi động để bật chế độ bất đồng bộ. Annotation `@EnableAsync` như sau:

```JAVA
// 省略其他注解 ...
@Import(AsyncConfigurationSelector.class)
public @interface EnableAsync { /* ... */ }
```

Trong annotation `@EnableAsync`, `AsyncConfigurationSelector` được import thông qua annotation `@Import`, vì vậy Spring sẽ tải lớp được import thông qua annotation `@Import`.

Lớp `AsyncConfigurationSelector` cài đặt interface `ImportSelector`, vì vậy trong lớp này sẽ override phương thức `selectImports()` để tùy chỉnh logic tải Bean:

```JAVA
public class AsyncConfigurationSelector extends AdviceModeImportSelector<EnableAsync> {
	@Override
	@Nullable
	public String[] selectImports(AdviceMode adviceMode) {
		switch (adviceMode) {
   // 基于 JDK 代理织入的通知
			case PROXY:
				return new String[] {ProxyAsyncConfiguration.class.getName()};
   // 基于 AspectJ 织入的通知
			case ASPECTJ:
				return new String[] {ASYNC_EXECUTION_ASPECT_CONFIGURATION_CLASS_NAME};
			default:
				return null;
		}
	}
}
```

Trong phương thức `selectImports()`, sẽ chọn tải các lớp khác nhau tùy thuộc vào loại advice, trong đó giá trị mặc định của `adviceMode` là `PROXY`.

Lấy advice dựa trên JDK proxy làm ví dụ, lúc này sẽ tải lớp `ProxyAsyncConfiguration`:

```JAVA
@Configuration
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public class ProxyAsyncConfiguration extends AbstractAsyncConfiguration {
	@Bean(name = TaskManagementConfigUtils.ASYNC_ANNOTATION_PROCESSOR_BEAN_NAME)
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public AsyncAnnotationBeanPostProcessor asyncAdvisor() {
		 // ...
  // 加载后置处理器
		AsyncAnnotationBeanPostProcessor bpp = new AsyncAnnotationBeanPostProcessor();

  // ...
		return bpp;
	}
}
```

### Bộ xử lý hậu kỳ (Post Processor)

Trong lớp `ProxyAsyncConfiguration`, một bộ xử lý hậu kỳ `AsyncAnnotationBeanPostProcessor` sẽ được tải thông qua annotation `@Bean`. Bộ xử lý hậu kỳ này là chìa khóa để annotation `@Async` hoạt động.

Nếu một lớp hoặc phương thức sử dụng annotation `@Async`, `AsyncAnnotationBeanPostProcessor` sẽ tạo một dynamic proxy cho lớp đó.

Khi các phương thức của lớp được thực thi, chúng sẽ bị interceptor của đối tượng proxy chặn lại, trong đó các phương thức được đánh dấu bởi annotation `@Async` sẽ được thực thi bất đồng bộ.

Code của `AsyncAnnotationBeanPostProcessor` như sau:

```JAVA
public class AsyncAnnotationBeanPostProcessor extends AbstractBeanFactoryAwareAdvisingPostProcessor {
	@Override
	public void setBeanFactory(BeanFactory beanFactory) {
		super.setBeanFactory(beanFactory);
  // 创建 AsyncAnnotationAdvisor，它是一个 Advisor
  // 用于拦截带有 @Async 注解的方法并将这些方法异步执行。
		AsyncAnnotationAdvisor advisor = new AsyncAnnotationAdvisor(this.executor, this.exceptionHandler);
  // 如果设置了自定义的 asyncAnnotationType，则将其设置到 advisor 中。
  // asyncAnnotationType 用于指定自定义的异步注解，例如 @MyAsync。
		if (this.asyncAnnotationType != null) {
			advisor.setAsyncAnnotationType(this.asyncAnnotationType);
		}
		advisor.setBeanFactory(beanFactory);
		this.advisor = advisor;
	}
}
```

Lớp cha của `AsyncAnnotationBeanPostProcessor` cài đặt interface `BeanFactoryAware`, vì vậy trong lớp này override phương thức `setBeanFactory()` làm điểm mở rộng để tải `AsyncAnnotationAdvisor`.

#### Tạo Advisor

`Advisor` là sự trừu tượng hóa `Advice` và `Pointcut` trong `Spring AOP`. `Advice` là logic thông báo được thực thi, `Pointcut` là điểm cắt thực thi thông báo.

Trong bộ xử lý hậu kỳ `AsyncAnnotationBeanPostProcessor`, `AsyncAnnotationAdvisor` sẽ được tạo ra. Trong constructor của nó, `Advice` và `Pointcut` tương ứng sẽ được xây dựng:

```JAVA
public class AsyncAnnotationAdvisor extends AbstractPointcutAdvisor implements BeanFactoryAware {

    private Advice advice; // 异步执行的 Advice
    private Pointcut pointcut; // 匹配 @Async 注解方法的切点

    // 构造函数
    public AsyncAnnotationAdvisor(/* 参数省略 */) {
        // 1. 创建 Advice，负责异步执行逻辑
        this.advice = buildAdvice(executor, exceptionHandler);
        // 2. 创建 Pointcut，选择要被增强的目标方法
        this.pointcut = buildPointcut(asyncAnnotationTypes);
    }

    // 创建 Advice
    protected Advice buildAdvice(/* 参数省略 */) {
        // 创建处理异步执行的拦截器
        AnnotationAsyncExecutionInterceptor interceptor = new AnnotationAsyncExecutionInterceptor(null);
        // 使用执行器和异常处理器配置拦截器
        interceptor.configure(executor, exceptionHandler);
        return interceptor;
    }

    // 创建 Pointcut
    protected Pointcut buildPointcut(Set<Class<? extends Annotation>> asyncAnnotationTypes) {
        ComposablePointcut result = null;
        for (Class<? extends Annotation> asyncAnnotationType : asyncAnnotationTypes) {
            // 1. 类级别切点：如果类上有注解则匹配
            Pointcut cpc = new AnnotationMatchingPointcut(asyncAnnotationType, true);
            // 2. 方法级别切点：如果方法上有注解则匹配
            Pointcut mpc = new AnnotationMatchingPointcut(null, asyncAnnotationType, true);

            if (result == null) {
                result = new ComposablePointcut(cpc);
            } else {
                // 使用 union 合并之前的切点
                result.union(cpc);
            }
            // 将方法级别切点添加到组合切点
            result = result.union(mpc);
        }
        // 返回组合切点，如果没有提供注解类型则返回 Pointcut.TRUE
        return (result != null ? result : Pointcut.TRUE);
    }
}
```

Điểm cốt lõi của `AsyncAnnotationAdvisor` nằm ở việc xây dựng `Advice` và `Pointcut`:

- Xây dựng `Advice`: Sẽ tạo interceptor `AnnotationAsyncExecutionInterceptor`. Trong phương thức `invoke()` của interceptor sẽ thực thi logic thông báo.
- Xây dựng `Pointcut`: Được tạo bởi `ClassFilter` và `MethodMatcher`, dùng để xác định các phương thức nào cần thực thi logic thông báo (`Advice`).

#### Logic xử lý hậu kỳ

Phương thức `postProcessAfterInitialization()` được cài đặt trong bộ xử lý hậu kỳ `AsyncAnnotationBeanPostProcessor` nằm ở lớp cha `AbstractAdvisingBeanPostProcessor`. Sau khi Bean được khởi tạo, sẽ vào phương thức `postProcessAfterInitialization()` để xử lý hậu kỳ.

Trong phương thức xử lý hậu kỳ, sẽ kiểm tra xem Bean có đủ điều kiện của Advisor thông báo trong bộ xử lý hậu kỳ không. Nếu đủ điều kiện, sẽ tạo đối tượng proxy:

```JAVA
// AbstractAdvisingBeanPostProcessor
public Object postProcessAfterInitialization(Object bean, String beanName) {
	if (this.advisor == null || bean instanceof AopInfrastructureBean) {
		return bean;
	}
	if (bean instanceof Advised) {
		Advised advised = (Advised) bean;
		if (!advised.isFrozen() && isEligible(AopUtils.getTargetClass(bean))) {
			if (this.beforeExistingAdvisors) {
				advised.addAdvisor(0, this.advisor);
			}
			else {
				advised.addAdvisor(this.advisor);
			}
			return bean;
		}
	}
 // 判断给定的 Bean 是否符合后置处理器中 Advisor 通知的条件，符合的话，就创建代理对象。
	if (isEligible(bean, beanName)) {
		ProxyFactory proxyFactory = prepareProxyFactory(bean, beanName);
		if (!proxyFactory.isProxyTargetClass()) {
			evaluateProxyInterfaces(bean.getClass(), proxyFactory);
		}
  // 添加 Advisor。
		proxyFactory.addAdvisor(this.advisor);
		customizeProxyFactory(proxyFactory);
  // 返回代理对象。
		return proxyFactory.getProxy(getProxyClassLoader());
	}
	return bean;
}
```

### Chặn bắt phương thức có annotation @Async

Việc thực thi phương thức được đánh dấu `@Async` sẽ bị chặn bắt trong `AnnotationAsyncExecutionInterceptor`. Logic của interceptor được thực thi trong phương thức `invoke()`. Lúc này, phương thức được đánh dấu bởi annotation `@Async` sẽ được đóng gói thành tác vụ bất đồng bộ và giao cho executor thực thi.

Phương thức `invoke()` được định nghĩa trong lớp cha `AsyncExecutionInterceptor` của `AnnotationAsyncExecutionInterceptor`:

```JAVA
public class AsyncExecutionInterceptor extends AsyncExecutionAspectSupport implements MethodInterceptor, Ordered {
	@Override
	@Nullable
	public Object invoke(final MethodInvocation invocation) throws Throwable {
		Class<?> targetClass = (invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null);
		Method specificMethod = ClassUtils.getMostSpecificMethod(invocation.getMethod(), targetClass);
		final Method userDeclaredMethod = BridgeMethodResolver.findBridgedMethod(specificMethod);

  // 1、确定异步任务执行器
		AsyncTaskExecutor executor = determineAsyncExecutor(userDeclaredMethod);

  // 2、将要执行的方法封装为 Callable 异步任务
		Callable<Object> task = () -> {
			try {
    // 2.1、执行方法
				Object result = invocation.proceed();
    // 2.2、如果方法返回值是 Future 类型，阻塞等待结果
				if (result instanceof Future) {
					return ((Future<?>) result).get();
				}
			}
			catch (ExecutionException ex) {
				handleError(ex.getCause(), userDeclaredMethod, invocation.getArguments());
			}
			catch (Throwable ex) {
				handleError(ex, userDeclaredMethod, invocation.getArguments());
			}
			return null;
		};
		// 3、提交任务
		return doSubmit(task, executor, invocation.getMethod().getReturnType());
	}
}
```

Trong phương thức `invoke()`, có 3 bước chính:

1. Xác định executor thực thi tác vụ bất đồng bộ.
2. Đóng gói phương thức được đánh dấu annotation `@Async` thành tác vụ bất đồng bộ `Callable`.
3. Giao tác vụ cho executor thực thi.

#### 1. Lấy executor tác vụ bất đồng bộ

Trong phương thức `determineAsyncExecutor()`, sẽ lấy executor của tác vụ bất đồng bộ (tức là **thread pool** thực thi tác vụ bất đồng bộ). Code như sau:

```JAVA
// 确定异步任务的执行器
protected AsyncTaskExecutor determineAsyncExecutor(Method method) {
 // 1、先从缓存中获取。
	AsyncTaskExecutor executor = this.executors.get(method);
	if (executor == null) {
		Executor targetExecutor;
  // 2、获取执行器的限定符。
		String qualifier = getExecutorQualifier(method);
		if (StringUtils.hasLength(qualifier)) {
   // 3、根据限定符获取对应的执行器。
			targetExecutor = findQualifiedExecutor(this.beanFactory, qualifier);
		}
		else {
   // 4、如果没有限定符，则使用默认的执行器。即 Spring 提供的默认线程池：SimpleAsyncTaskExecutor。
			targetExecutor = this.defaultExecutor.get();
		}
		if (targetExecutor == null) {
			return null;
		}
  // 5、将执行器包装为 TaskExecutorAdapter 适配器。
  // TaskExecutorAdapter 是 Spring 对于 JDK 线程池做的一层抽象，还是继承自 JDK 的线程池 Executor。这里可以不用管太多，只要知道它是线程池就可以了。
		executor = (targetExecutor instanceof AsyncListenableTaskExecutor ?
				(AsyncListenableTaskExecutor) targetExecutor : new TaskExecutorAdapter(targetExecutor));
		this.executors.put(method, executor);
	}
	return executor;
}
```

Trong phương thức `determineAsyncExecutor()`, executor của tác vụ bất đồng bộ (thread pool) được xác định chủ yếu thông qua việc lấy qualifier từ giá trị `value` của annotation `@Async`, sau đó tìm executor tương ứng trong `BeanFactory` theo qualifier.

Nếu không chỉ định thread pool trong annotation `@Async`, sẽ lấy thread pool mặc định thông qua `this.defaultExecutor.get()`. `defaultExecutor` được gán giá trị trong phương thức dưới đây:

```JAVA
// AsyncExecutionInterceptor
protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
 // 1、尝试从 beanFactory 中获取线程池。
	Executor defaultExecutor = super.getDefaultExecutor(beanFactory);
 // 2、如果 beanFactory 中没有，则创建 SimpleAsyncTaskExecutor 线程池。
	return (defaultExecutor != null ? defaultExecutor : new SimpleAsyncTaskExecutor());
}
```

Trong đó `super.getDefaultExecutor()` sẽ cố gắng lấy thread pool kiểu `Executor` từ `beanFactory`. Code như sau:

```JAVA
protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
	if (beanFactory != null) {
		try {
   // 1、从 beanFactory 中获取 TaskExecutor 类型的线程池。
			return beanFactory.getBean(TaskExecutor.class);
		}
		catch (NoUniqueBeanDefinitionException ex) {
			try {
				// 2、如果有多个，则尝试从 beanFactory 中获取执行名称的 Executor 线程池。
				return beanFactory.getBean(DEFAULT_TASK_EXECUTOR_BEAN_NAME, Executor.class);
			}
			catch (NoSuchBeanDefinitionException ex2) {
				if (logger.isInfoEnabled()) {
					// ...
				}
			}
		}
		catch (NoSuchBeanDefinitionException ex) {
			try {
    // 3、如果没有，则尝试从 beanFactory 中获取执行名称的 Executor 线程池。
				return beanFactory.getBean(DEFAULT_TASK_EXECUTOR_BEAN_NAME, Executor.class);
			}
			catch (NoSuchBeanDefinitionException ex2) {
				// ...
			}
		}
	}
	return null;
}
```

Trong `getDefaultExecutor()`, nếu việc lấy thread pool từ `beanFactory` thất bại, sẽ tạo thread pool `SimpleAsyncTaskExecutor`.

Thread pool này mỗi khi thực thi tác vụ bất đồng bộ đều sẽ tạo một luồng mới để thực thi tác vụ, không tái sử dụng luồng, dẫn đến chi phí thực thi tác vụ bất đồng bộ rất lớn. Một khi số lượng concurrent tăng đột biến tại một thời điểm nào đó với các phương thức được đánh dấu `@Async`, ứng dụng sẽ tạo ra rất nhiều luồng, ảnh hưởng đến chất lượng dịch vụ thậm chí gây ra tình trạng dịch vụ không khả dụng.

Nếu gửi 10000 tác vụ cùng lúc vào thread pool `SimpleAsyncTaskExecutor`, thread pool đó sẽ tạo ra 10000 luồng. Phương thức `execute()` của nó như sau:

```JAVA
// SimpleAsyncTaskExecutor：execute() 内部会调用 doExecute()
protected void doExecute(Runnable task) {
    // 创建新线程
    Thread thread = (this.threadFactory != null ? this.threadFactory.newThread(task) : createThread(task));
    thread.start();
}
```

**Khuyến nghị: Khi sử dụng `@Async`, cần tự chỉ định thread pool để tránh rủi ro từ thread pool mặc định của Spring.**

Trong `value` của annotation `@Async` chỉ định qualifier của thread pool, thông qua qualifier có thể lấy **thread pool tùy chỉnh**. Code lấy qualifier như sau:

```JAVA
// AnnotationAsyncExecutionInterceptor
protected String getExecutorQualifier(Method method) {
	// 1.从方法上获取 Async 注解。
	Async async = AnnotatedElementUtils.findMergedAnnotation(method, Async.class);
 // 2. 如果方法上没有找到 @Async 注解，则尝试从方法所在的类上获取 @Async 注解。
	if (async == null) {
		async = AnnotatedElementUtils.findMergedAnnotation(method.getDeclaringClass(), Async.class);
	}
 // 3. 如果找到了 @Async 注解，则获取注解的 value 值并返回，作为线程池的限定符。
 //    如果 "value" 属性值为空字符串，则使用默认的线程池。
 //    如果没有找到 @Async 注解，则返回 null，同样使用默认的线程池。
	return (async != null ? async.value() : null);
}
```

#### 2. Đóng gói phương thức thành tác vụ bất đồng bộ

Sau khi lấy executor trong phương thức `invoke()`, phương thức sẽ được đóng gói thành tác vụ bất đồng bộ:

```JAVA
// 将要执行的方法封装为 Callable 异步任务
Callable<Object> task = () -> {
    try {
        // 2.1、执行被拦截的方法 (proceed() 方法是 AOP 中的核心方法，用于执行目标方法)
        Object result = invocation.proceed();

        // 2.2、如果被拦截方法的返回值是 Future 类型，则需要阻塞等待结果，
        //     并将 Future 的结果作为异步任务的结果返回。 这是为了处理异步方法嵌套调用的情况。
        //     例如，一个异步方法内部调用了另一个异步方法，则需要等待内部异步方法执行完成，
        //     才能返回最终的结果。
        if (result instanceof Future) {
            return ((Future<?>) result).get(); // 阻塞等待 Future 的结果
        }
    }
    catch (ExecutionException ex) {
        // 2.3、处理 ExecutionException 异常。 ExecutionException 是 Future.get() 方法抛出的异常，
        handleError(ex.getCause(), userDeclaredMethod, invocation.getArguments()); // 处理原始异常
    }
    catch (Throwable ex) {
        // 2.4、处理其他类型的异常。 将异常、被拦截的方法和方法参数作为参数调用 handleError() 方法进行处理。
        handleError(ex, userDeclaredMethod, invocation.getArguments());
    }
    // 2.5、如果方法返回值不是 Future 类型，或者发生异常，则返回 null。
    return null;
};
```

So với `Runnable`, `Callable` có thể trả về kết quả và ném ra ngoại lệ.

Việc thực thi `invocation.proceed()` (thực thi phương thức gốc) được đóng gói thành tác vụ bất đồng bộ `Callable`. Ở đây chỉ trả về khi `result` (giá trị trả về của phương thức) có kiểu `Future`, còn các kiểu khác thì trả về `null` trực tiếp.

Vì vậy, nếu phương thức được đánh dấu annotation `@Async` sử dụng kiểu trả về khác ngoài `Future`, thì không thể lấy kết quả thực thi của phương thức.

#### 3. Gửi tác vụ bất đồng bộ

Sau khi đóng gói phương thức cần thực thi thành tác vụ Callable trong `AsyncExecutionInterceptor # invoke()`, tác vụ sẽ được giao cho executor thực thi. Code liên quan đến gửi tác vụ như sau:

```JAVA
protected Object doSubmit(Callable<Object> task, AsyncTaskExecutor executor, Class<?> returnType) {
    // 根据方法的返回值类型，选择不同的异步执行方式并返回结果。
    // 1. 如果方法返回值是 CompletableFuture 类型
    if (CompletableFuture.class.isAssignableFrom(returnType)) {
        // 使用 CompletableFuture.supplyAsync() 方法异步执行任务。
        return CompletableFuture.supplyAsync(() -> {
            try {
                return task.call();
            }
            catch (Throwable ex) {
                throw new CompletionException(ex); // 将异常包装为 CompletionException，以便在 future.get() 时抛出
            }
        }, executor);
    }
    // 2. 如果方法返回值是 ListenableFuture 类型
    else if (ListenableFuture.class.isAssignableFrom(returnType)) {
        // 将 AsyncTaskExecutor 强制转换为 AsyncListenableTaskExecutor，
        // 并调用 submitListenable() 方法提交任务。
        // AsyncListenableTaskExecutor 是 ListenableFuture 的专用异步执行器，
        // 它可以返回一个 ListenableFuture 对象，允许添加回调函数来监听任务的完成。
        return ((AsyncListenableTaskExecutor) executor).submitListenable(task);
    }
    // 3. 如果方法返回值是 Future 类型
    else if (Future.class.isAssignableFrom(returnType)) {
        // 直接调用 AsyncTaskExecutor 的 submit() 方法提交任务，并返回一个 Future 对象。
        return executor.submit(task);
    }
    // 4. 如果方法返回值是 void 或其他类型
    else {
        // 直接调用 AsyncTaskExecutor 的 submit() 方法提交任务。
        // 由于方法返回值是 void，因此不需要返回任何结果，直接返回 null。
        executor.submit(task);
        return null;
    }
}
```

Trong phương thức `doSubmit()`, dựa trên kiểu trả về khác nhau của phương thức được đánh dấu annotation `@Async`, sẽ chọn phương thức gửi tác vụ khác nhau, và cuối cùng tác vụ sẽ được executor (thread pool) thực thi.

### Tổng kết

![Tóm tắt nguyên lý Async](./images/async/async.png)

Điểm cốt lõi để hiểu nguyên lý `@Async` nằm ở việc hiểu annotation `@EnableAsync`. Annotation này bật tính năng tác vụ bất đồng bộ.

Luồng chính như hình trên: bộ xử lý hậu kỳ sẽ tạo đối tượng proxy, sau đó việc thực thi phương thức `@Async` trong đối tượng proxy sẽ đi vào interceptor bên trong `Advice`, sau đó đóng gói phương thức thành tác vụ bất đồng bộ và gửi vào thread pool để xử lý.

## Khuyến nghị sử dụng @Async

### Tùy chỉnh thread pool

Nếu không cấu hình thread pool một cách rõ ràng, nội tại `@Async` sẽ cố gắng lấy thread pool từ `BeanFactory` trước. Nếu không lấy được, sẽ tạo một cài đặt `SimpleAsyncTaskExecutor`. `SimpleAsyncTaskExecutor` về bản chất không phải là một thread pool thực sự, vì nó khởi động một luồng mới cho mỗi yêu cầu mà không tái sử dụng luồng hiện có, điều này có thể gây ra một số vấn đề tiềm ẩn như tiêu thụ tài nguyên quá mức.

Để biết chi tiết về cách lấy thread pool, tham khảo bài viết này: [Phân tích nguyên lý thread pool bất đồng bộ nền của annotation Async trong Spring｜Dewu Technology](https://mp.weixin.qq.com/s/FySv5L0bCdrlb5MoSfQtAA).

Nhất định phải cấu hình rõ ràng một thread pool, khuyến nghị dùng `ThreadPoolTaskExecutor`. Ngoài ra, có thể chỉ định các thread pool khác nhau cho các phương thức bất đồng bộ khác nhau dựa trên tính chất và yêu cầu của tác vụ.

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "executor1")
    public Executor executor1() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("AsyncExecutor1-");
        executor.initialize();
        return executor;
    }

    @Bean(name = "executor2")
    public Executor executor2() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("AsyncExecutor2-");
        executor.initialize();
        return executor;
    }
}
```

Chỉ định tên Bean của thread pool trong annotation `@Async`:

```java
@Service
public class AsyncService {

    @Async("executor1")
    public void performTask1() {
        // 任务1的逻辑
        System.out.println("Executing Task1 with Executor1");
    }

    @Async("executor2")
    public void performTask2() {
        // 任务2的逻辑
        System.out.println("Executing Task2 with Executor2");
    }
}
```

### Tránh annotation @Async bị vô hiệu hóa

Annotation `@Async` sẽ bị vô hiệu hóa trong các tình huống sau, cần lưu ý:

**1. Gọi phương thức bất đồng bộ trong cùng một lớp**

Nếu bạn gọi một phương thức được đánh dấu `@Async` từ bên trong cùng một lớp, phương thức đó sẽ không được thực thi bất đồng bộ.

```java
@Service
public class MyService {

    public void myMethod() {
        // 直接通过 this 引用调用，绕过了 Spring 的代理机制，异步执行失效
        asyncMethod();
    }

    @Async
    public void asyncMethod() {
        // 异步执行的逻辑
    }
}
```

Điều này là vì cơ chế bất đồng bộ của Spring được thực hiện thông qua **proxy**. Các lời gọi phương thức bên trong cùng một lớp sẽ bỏ qua cơ chế proxy của Spring, tức là bỏ qua đối tượng proxy và gọi trực tiếp thông qua tham chiếu `this`. Vì không đi qua proxy, tất cả các xử lý liên quan đến proxy (tức là gửi tác vụ vào thread pool để thực thi bất đồng bộ) đều không xảy ra.

Để tránh vấn đề này, cách được khuyến nghị là chuyển phương thức bất đồng bộ sang một Spring Bean khác.

```java
@Service
public class AsyncService {
    @Async
    public void asyncMethod() {
        // 异步执行的逻辑
    }
}

@Service
public class MyService {
    @Autowired
    private AsyncService asyncService;

    public void myMethod() {
        asyncService.asyncMethod();
    }
}
```

**2. Sử dụng từ khóa static để sửa đổi phương thức bất đồng bộ**

Nếu phương thức được đánh dấu `@Async` được sửa đổi bởi từ khóa `static`, phương thức đó sẽ không được thực thi bất đồng bộ.

Điều này là vì cơ chế bất đồng bộ của Spring được thực hiện thông qua proxy. Vì phương thức tĩnh không thuộc về instance mà thuộc về lớp và không tham gia kế thừa, cơ chế proxy của Spring (dù dựa trên JDK hay CGLIB) không thể chặn phương thức tĩnh để cung cấp các tính năng nâng cao như thực thi bất đồng bộ.

Do giới hạn dung lượng, không đi sâu chi tiết hơn ở đây. Những bạn chưa hiểu cơ chế proxy có thể xem bài viết [Giải thích chi tiết mô hình proxy trong Java](https://javaguide.cn/java/basis/proxy.html).

Nếu cần thực thi bất đồng bộ logic của một phương thức tĩnh, có thể cân nhắc thiết kế một phương thức bọc không tĩnh. Phương thức bọc này sử dụng annotation `@Async` và bên trong gọi phương thức tĩnh.

```java
@Service
public class AsyncService {

    @Async
    public void asyncWrapper() {
        // 调用静态方法
        SClass.staticMethod();
    }
}

public class SClass {
    public static void staticMethod() {
        // 执行一些操作
    }
}
```

**3. Quên bật hỗ trợ bất đồng bộ**

Spring Boot mặc định không bật hỗ trợ bất đồng bộ. Đảm bảo thêm annotation `@EnableAsync` vào lớp cấu hình chính `Application` để bật tính năng bất đồng bộ.

```java
@SpringBootApplication
@EnableAsync
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**4. Lớp chứa phương thức có annotation `@Async` phải là Spring Bean**

Phương thức có annotation `@Async` phải nằm trong Bean được Spring quản lý. Chỉ như vậy Spring mới có thể áp dụng proxy khi tạo Bean. Proxy có thể chặn lời gọi phương thức và thực hiện logic thực thi bất đồng bộ. Nếu phương thức không nằm trong bean được Spring quản lý, Spring không thể tạo proxy cần thiết và annotation `@Async` sẽ không có hiệu lực.

### Kiểu trả về

Khuyến nghị định nghĩa kiểu trả về của phương thức có annotation `@Async` là `void` hoặc `Future`.

- Nếu không cần lấy kết quả trả về của phương thức bất đồng bộ, định nghĩa kiểu trả về là `void`.
- Nếu cần lấy kết quả trả về của phương thức bất đồng bộ, định nghĩa kiểu trả về là `Future` (ví dụ: `CompletableFuture`, `ListenableFuture`).

Nếu định nghĩa kiểu trả về của phương thức có annotation `@Async` là kiểu khác (như `Object`, `String`, v.v.), thì không thể lấy giá trị trả về của phương thức.

Thiết kế này phù hợp với nguyên tắc cơ bản của lập trình bất đồng bộ: người gọi không nên ngay lập tức mong đợi một kết quả, mà nên có khả năng lấy kết quả vào một thời điểm nào đó trong tương lai. Nếu kiểu trả về là `Future`, người gọi có thể sử dụng đối tượng `Future` được trả về để kiểm tra trạng thái tác vụ, hủy tác vụ, hoặc lấy kết quả khi tác vụ hoàn thành.

### Xử lý ngoại lệ trong phương thức bất đồng bộ

Các ngoại lệ được ném ra từ phương thức bất đồng bộ mặc định sẽ không bị người gọi bắt. Để quản lý các ngoại lệ này, khuyến nghị sử dụng tính năng xử lý ngoại lệ của `CompletableFuture`, hoặc cấu hình một `AsyncUncaughtExceptionHandler` toàn cục để xử lý các ngoại lệ không được bắt đúng cách.

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer{

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }

}

// 自定义异常处理器
class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {

    @Override
    public void handleUncaughtException(Throwable ex, Method method, Object... params) {
        // 日志记录或其他处理逻辑
    }
}
```

### Chưa cân nhắc quản lý giao dịch

Khi phương thức có annotation `@Async` cần hỗ trợ giao dịch, cần sử dụng độc lập trên phương thức bất đồng bộ đó.

```java
@Service
public class AsyncTransactionalService {

    @Async
    // Propagation.REQUIRES_NEW 表示 Spring 在执行异步方法时开启一个新的、与当前事务无关的事务
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void asyncTransactionalMethod() {
        // 这里的操作会在新的事务中执行
        // 执行一些数据库操作
    }
}
```

### Chưa chỉ định thứ tự thực thi phương thức bất đồng bộ

Việc thực thi các phương thức có annotation `@Async` là không chặn, chúng có thể hoàn thành theo bất kỳ thứ tự nào. Nếu cần xử lý kết quả theo thứ tự cụ thể, bạn có thể đặt kiểu trả về của phương thức là `Future` hoặc `CompletableFuture`, sử dụng đối tượng trả về để đảm bảo một phương thức thực thi sau khi phương thức khác hoàn thành.

```java
@Async
public CompletableFuture<String> fetchDataAsync() {
    return CompletableFuture.completedFuture("Data");
}

@Async
public CompletableFuture<String> processDataAsync(String data) {
    return CompletableFuture.supplyAsync(() -> "Processed " + data);
}
```

Phương thức `processDataAsync` thực thi sau `fetchDataAsync`:

```java
CompletableFuture<String> dataFuture = asyncService.fetchDataAsync();
dataFuture.thenCompose(data -> asyncService.processDataAsync(data))
          .thenAccept(result -> System.out.println(result));
```

##

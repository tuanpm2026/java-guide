---
title: Công nghệ giọng nói AI: Từ ASR, TTS đến triển khai thực tế Voice Agent
description: Phân tích chuyên sâu hệ thống giọng nói AI, bao gồm thu âm, VAD, ASR, LLM, TTS, phát streaming, xử lý ngắt lời, tối ưu độ trễ và lựa chọn API đám mây, mô hình cục bộ, kết hợp.
category: Phát triển ứng dụng AI
head:
  - - meta
    - name: keywords
      content: AI语音,ASR,TTS,VAD,实时语音Agent,Speech to Speech,语音识别,语音合成,端云混合,Realtime API
---

<!-- @include: @article-header.snippet.md -->

Xin chào mọi người, mình là Guide.

Nhiều developer lần đầu làm ứng dụng giọng nói AI đều có một ý tưởng rất đơn giản: người dùng nói, chuyển thành text, đưa vào mô hình lớn, rồi đọc lại câu trả lời.

Nghe có vẻ chỉ là ba bước gọi API: **ASR -> LLM -> TTS**.

Nhưng khi đẩy lên môi trường production, vấn đề ngay lập tức xuất hiện: người dùng chưa nói xong, hệ thống đã phán đoán nhầm là kết thúc; người dùng muốn ngắt lời, AI vẫn tự đọc tiếp; phòng họp có tiếng điều hòa và bàn phím, ASR bắt đầu nhận dạng lung tung; mạng hơi giật, âm thanh downstream bị đứt từng đoạn; trông mô hình rất thông minh, nhưng khi nói chuyện thực tế lại như nhân viên tổng đài phản ứng chậm.

Điều phức tạp nhất của hệ thống giọng nói AI nằm ở đây: **đây không đơn giản là gắn mic và loa cho text Agent, mà là một hệ thống gồm xử lý audio thời gian thực, mô hình giọng nói, trạng thái hội thoại và phối hợp đầu cuối-đám mây cùng nhau**.

Bài viết này gần 20.000 chữ, khuyên bạn nên bookmark, qua bài này bạn sẽ hiểu được:

1. Nguyên lý cốt lõi của ASR, TTS, VAD, cách lựa chọn giữa API đám mây và mô hình cục bộ.
2. Những khó khăn cốt lõi của tương tác giọng nói thời gian thực: độ trễ, ngắt lời, tiếng ồn, context và khả năng phía client đều vướng mắc ở đâu.
3. Cách triển khai Voice Agent cơ bản từng bước qua dự án interview-guide.
4. Vai trò thực tế và lựa chọn cấu hình của WebRTC trong xử lý audio phía client.
5. Các điểm quan trọng khi triển khai production: thiết kế state machine, xử lý ngắt lời, kiểm soát chi phí.
6. Hướng phát triển tiếp theo của Voice Agent.

## Giải thích thuật ngữ

Để tránh nhầm lẫn khi đọc, các thuật ngữ cốt lõi trong bài được giải thích như sau:

- **Phía client** = client (browser/App), chỉ code frontend trên thiết bị người dùng
- **Barge-in** = ngắt lời/chen vào, tức là người dùng chủ động ngắt AI đang nói trong quá trình mô hình phản hồi
- **Kết quả tăng dần** = output streaming = partial results, chỉ kết quả nhận dạng trung gian mà ASR trả về theo thời gian thực
- **Giải pháp cascade** = kiến trúc ASR + LLM + TTS nối tiếp theo từng giai đoạn
- **Realtime API native** = Speech-to-Speech, mô hình đa phương thức end-to-end, nhận audio vào và xuất audio ra

## Hệ thống giọng nói AI thực sự giải quyết vấn đề gì?

Trước khi nói về kỹ thuật, hãy làm rõ chúng ta đang giải quyết vấn đề gì.

Mục tiêu cốt lõi của Voice Agent là **cho phép máy móc đối thoại tự nhiên như con người**. Nghe có vẻ đơn giản, nhưng so với đối thoại văn bản, giọng nói có thêm nhiều chiều:

- **Thời gian thực**: khi người dùng nói, hệ thống phải bắt đầu làm việc ngay, không thể đợi người dùng nói xong mới phản ứng.
- **Thông tin đa phương thức**: giọng điệu, ngừng nghỉ, cảm xúc - những thứ này đều bị mất trong văn bản.
- **Khả năng ngắt lời**: người nói có thể ngắt nhau, máy cũng phải hỗ trợ điều này.
- **Độ trễ end-to-end**: chat văn bản chậm 1 giây người dùng còn chịu được, giọng nói chậm 1 giây sẽ cảm thấy đối phương "không phản hồi".

Trên thị trường có hai loại tương tác giọng nói phổ biến:

1. **Trợ lý giọng nói truyền thống**: Siri, tiểu Ai, giọng nói xe hơi. Bạn nói "bật điều hòa", nó thực thi lệnh cố định. Về bản chất là hệ thống menu dạng giọng nói.
2. **Voice Agent mô hình lớn**: có thể hiểu câu hỏi mở, gọi công cụ, tiếp tục đa vòng hội thoại. Bạn hỏi "giúp tôi xem API timeout tuần trước là sao", nó cần hiểu ý định, tìm context, tạo câu trả lời, và xác nhận qua lại với bạn bằng giọng nói.

Logic cơ bản của hai loại này hoàn toàn khác nhau. Bài này chủ yếu thảo luận về loại sau, tức triển khai thực tế của Voice Agent mô hình lớn.

## ASR chuyển đổi âm thanh thành văn bản như thế nào?

ASR (Automatic Speech Recognition) trông có vẻ chỉ là "audio vào, text ra", nhưng phía sau có ít nhất ba quá trình phán đoán:

1. Đoạn audio này nói những chữ gì.
2. Những chữ đó cắt thành từ và câu thế nào.
3. Dấu câu, số, tiếng Anh, thuật ngữ kỹ thuật được chuẩn hóa thế nào.

Ví dụ người dùng nói "giúp tôi tra Java 21 virtual thread", ASR phải đồng thời nhận dạng tiếng Trung, tiếng Anh, số và từ kỹ thuật. Nếu nhận dạng sai, LLM phía sau dù mạnh đến đâu cũng phải đoán một lúc.

### Ba hướng kỹ thuật của ASR

| Loại                     | Giải pháp tiêu biểu                                                                                                                      | Ưu điểm                                                                                     | Nhược điểm                                                                                    | Phù hợp cho                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| API đám mây              | OpenAI Transcription (gpt-4o-transcribe, whisper-1, gpt-4o-transcribe-diarize), Azure Speech, Google Speech, Deepgram, Alibaba Cloud ASR | Tích hợp nhanh, hỗ trợ nhiều ngôn ngữ, chi phí vận hành thấp                                | Chi phí, độ trễ mạng, hạn chế tuân thủ dữ liệu                                                | Dịch vụ khách hàng, chuyển đổi cuộc họp, trợ lý giọng nói nhẹ |
| Mô hình nguồn mở         | Whisper, faster-whisper, Whisper.cpp, FunASR                                                                                             | Có thể triển khai cục bộ, kiểm soát tốt, hỗ trợ private; faster-whisper tích hợp Silero VAD | Cần tự tối ưu kỹ thuật cho thời gian thực; Whisper turbo không được huấn luyện cho dịch thuật | Chuyển đổi private, phụ đề offline, intranet doanh nghiệp     |
| Mô hình domain tùy chỉnh | ASR chuyên dụng cho tài chính, y tế, xe hơi                                                                                              | Thích nghi tốt hơn với từ chuyên ngành và giọng địa phương                                  | Chi phí chuẩn bị dữ liệu và huấn luyện cao                                                    | Các use case dọc tần suất cao, từ điển nghiệp vụ mạnh         |

**Ghi chú bổ sung**:

- `gpt-4o-transcribe-diarize` của OpenAI hỗ trợ nhãn người nói, phù hợp cho các tình huống nhiều người như chuyển đổi cuộc họp; lưu ý: không hỗ trợ Realtime API, không hỗ trợ context prompt, giới hạn audio block 1400 giây (~23 phút). Nếu không cần nhãn người nói, ưu tiên dùng `gpt-4o-transcribe` hoặc `whisper-1`
- Whisper turbo (large-v3-turbo) là phiên bản tối ưu inference của large-v3, nhanh hơn nhưng **không được huấn luyện cho tác vụ dịch thuật**, khi thực thi `--task translate` sẽ output ngôn ngữ gốc chứ không phải tiếng Anh, cần dịch thuật hãy dùng medium hoặc large

**Khuyến nghị lựa chọn**: Nếu nhu cầu cốt lõi của bạn là "hội thoại thời gian thực", đừng chỉ nhìn vào WER offline (Word Error Rate, tỷ lệ lỗi từ). Bạn nên quan tâm hơn đến:

- **Độ trễ đoạn đầu**: thời gian từ khi người dùng nói xong đến khi thấy ký tự đầu tiên
- **Ổn định kết quả tăng dần**: có thể xem tiến độ nhận dạng theo thời gian thực không
- **Độ chính xác phát hiện endpoint**: có thể phán đoán chính xác người dùng đã nói xong chưa
- **Hiệu suất trong môi trường nhiễu**: xa mic, nhiều người nói có chính xác không
- **Khả năng hot word**: có thể nhận dạng từ vựng nghiệp vụ riêng của bạn không

### Sự khác biệt giữa ASR streaming và không streaming

Làm hội thoại thời gian thực bắt buộc phải dùng ASR streaming. Sự khác biệt là:

- **ASR không streaming**: đợi người dùng nói xong một đoạn, rồi nhận dạng cả đoạn. Độ trễ = thời gian nói + thời gian nhận dạng.
- **ASR streaming**: nhận dạng trong khi nói, ngay khi người dùng vừa dứt lời đã có kết quả. Độ trễ ≈ thời gian phát hiện endpoint + thời gian nhận dạng thời gian thực.

Dự án interview-guide dùng **qwen3-asr-flash-realtime của Alibaba Cloud DashScope**, đây là ASR streaming được điều khiển bởi server-side VAD:

```java
// QwenAsrService.java
OmniRealtimeConfig config = OmniRealtimeConfig.builder()
    .modalities(Collections.singletonList(OmniRealtimeModality.TEXT))
    .enableTurnDetection(true)  // 开启服务端 VAD
    .turnDetectionType("server_vad")
    .turnDetectionSilenceDurationMs(400)  // 400ms 静音判定用户说完
    .transcriptionConfig(transcriptionParam)
    .build();
```

Lợi ích của server-side VAD là **client không cần làm phát hiện hoạt động giọng nói phức tạp**, nhưng cái giá phải trả là bạn phải đợi 400ms im lặng mới phán đoán người dùng nói xong. Trong trải nghiệm thực tế, 400ms này khá rõ ràng, vì vậy nhiều giải pháp chuyển sang dùng client VAD trigger trước, frontend submit trước, rồi đợi server xác nhận.

## TTS chuyển đổi văn bản thành âm thanh như thế nào?

TTS (Text To Speech) chịu trách nhiệm tổng hợp audio từ câu trả lời của mô hình. Trông có vẻ là lớp output, nhưng thực ra ảnh hưởng rất lớn đến cảm nhận của người dùng về toàn bộ Agent.

Cùng một câu "để tôi xem giúp bạn", sự khác biệt giữa các TTS khác nhau có thể thể hiện ở:

- Đợi bao lâu mới có audio chunk đầu tiên
- Giọng có tự nhiên không, câu dài có thở như người thật không
- Đọc số, code, từ viết tắt tiếng Anh có chính xác không
- Có hỗ trợ kiểm soát cảm xúc, tốc độ, ngừng nghỉ, cao độ không

### Sự phát triển kỹ thuật của TTS

TTS truyền thống gồm nhiều bước:

```
文本规范化 -> 文本分析 -> 声学模型 -> 声码器 -> 波形输出
```

Các mô hình end-to-end chủ đạo hiện nay (như VALL-E, Fish Speech, CosyVoice) đã nén chuỗi pipeline này lại, hiệu quả cũng tốt hơn. Nhưng với Voice Agent thời gian thực, **chất lượng âm thanh từng câu không phải quan trọng nhất, khả năng phát được dạng streaming mới là chính**.

Nếu bạn phải đợi toàn bộ văn bản được tạo xong mới có thể tổng hợp, cảm nhận của người dùng sẽ rất chậm. Nếu có thể tổng hợp streaming theo từng câu ngắn hoặc thậm chí theo token, trải nghiệm chunk đầu tiên sẽ tốt hơn nhiều.

### Hai hướng cho TTS thời gian thực

| Loại                       | Giải pháp tiêu biểu                                                         | Đặc điểm                                         |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| TTS thời gian thực đám mây | OpenAI Speech, Alibaba Cloud qwen-tts-realtime, Azure TTS, ElevenLabs       | Output streaming, hỗ trợ tổng hợp thời gian thực |
| TTS cục bộ                 | piper1-gpl (GPL-3.0 ⚠️ Piper gốc đã được archive), Fish Speech (Apache 2.0) | Kiểm soát tốt, phù hợp offline                   |

interview-guide cũng dùng qwen-tts-realtime của Alibaba Cloud, tổng hợp thời gian thực qua WebSocket:

```java
// QwenTtsService.java
QwenTtsRealtimeConfig config = QwenTtsRealtimeConfig.builder()
    .voice(voice)  // 音色选择
    .responseFormat(QwenTtsRealtimeAudioFormat.PCM_24000HZ_MONO_16BIT)
    .mode("commit")  // 提交模式
    .languageType(languageType)
    .speechRate(speechRate)
    .volume(volume)
    .build();

// 发送文本，实时接收音频块
qwenTtsRealtime.appendText(text);
qwenTtsRealtime.commit();
```

Mỗi lần tổng hợp sẽ thiết lập kết nối WebSocket mới, nhận sự kiện `response.audio.delta`, ghép các audio chunk lại.

## Tại sao VAD là "người gác cổng vô hình" của hệ thống giọng nói?

Component VAD (Voice Activity Detection - Phát hiện hoạt động giọng nói) thường bị bỏ qua, nhưng ảnh hưởng của nó đến trải nghiệm rất lớn.

Nhiệm vụ của VAD không phải nhận dạng nội dung, mà là phán đoán:

- Người dùng đã bắt đầu nói chưa?
- Người dùng đã nói xong chưa?
- Âm thanh hiện tại là giọng người, tiếng ồn nền, âm nhạc, hay âm thanh hệ thống đang phát?

Việc này tưởng đơn giản, thực ra rất khó. Vì người dùng thật sự nói chuyện không phải đọc tin tức:

- Giữa câu sẽ ngừng: "Vấn đề này... tôi muốn hỏi một chút..."
- Sẽ có phản hồi ngắn: "Ừ", "Đúng", "Không phải"
- Vừa nghĩ vừa nói, âm lượng lúc to lúc nhỏ
- Bên cạnh có thể có người nói chuyện, loa cũng đang phát âm thanh AI

**Client VAD hay Server-side VAD?**

| Loại            | Giải pháp tiêu biểu                           | Ưu điểm                                          | Nhược điểm                                                                        |
| --------------- | --------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| Client VAD      | WebRTC VAD, Silero VAD ⚠️, @ricky0123/vad-web | Phản hồi nhanh, không tiêu thụ tài nguyên server | Cần triển khai mô hình ở client; Silero recall ~86%, phát hiện giọng nói ngắn yếu |
| Server-side VAD | Tích hợp sẵn trong DashScope ASR, Whisper ASR | Không cần quan tâm client                        | Tăng tải server, có độ trễ mạng                                                   |

> ⚠️ **Hạn chế của Silero VAD**: áp dụng chiến lược bảo thủ để giảm false positive, cái giá là recall ~86%, khả năng phát hiện giọng nói ngắn (<1 giây như "ừ", "đúng", "không phải") giảm đáng kể. Trong Voice Agent, tín hiệu phản hồi ngắn và ngắt lời của người dùng có thể bị bỏ sót. Nếu độ phản hồi ngắt lời là chỉ số cốt lõi, hãy xem xét giải pháp VAD hai tầng hoặc dùng detector cân bằng hơn.

Frontend của interview-guide dùng **@ricky0123/vad-web**, đây là client VAD dựa trên ONNX:

```typescript
// AudioRecorder.tsx
const vadInstance = await window.vad.MicVAD.new({
  getStream: async () => stream,
  onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
  baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/",
  onSpeechStart: () => {
    onSpeechStart?.(); // 用户开始说话
  },
  onSpeechEnd: () => {
    onSpeechEnd?.(); // 用户说完
  },
});
```

**Điểm dễ mắc lỗi tần suất cao**: sau khi client VAD trigger `onSpeechEnd`, đừng nghĩ người dùng đã thực sự nói xong. Tốt nhất đợi thêm 300-500ms im lặng để xác nhận, tránh nhầm lẫn khoảng ngừng giữa câu của người dùng thành kết thúc.

Khuyến nghị của tôi: **VAD không nên chỉ dùng như công tắc, nó nên output một tập tín hiệu điều khiển hội thoại**. Ví dụ:

- `speech_start`: người dùng bắt đầu nói
- `speech_end`: người dùng nói xong (kèm độ tin cậy)
- `maybe_barge_in`: có thể người dùng đang ngắt lời
- `noise_only`: chỉ có tiếng ồn, không ai nói

## Một cuộc hội thoại giọng nói hoàn chỉnh chạy như thế nào?

Hãy phân tích rõ toàn bộ pipeline trước, phần sau mới có context để đi vào chi tiết.

Một vòng hội thoại Voice Agent đại khái trải qua những bước này:

1. Thu âm: mic thu âm raw audio
2. Tiền xử lý: AEC khử echo, NS khử nhiễu, AGC điều chỉnh gain
3. Phát hiện VAD: phán đoán người dùng có đang nói không, có nói xong không
4. Upload audio: gửi audio đã xử lý lên server
5. ASR chuyển đổi: chuyển audio thành văn bản (output tăng dần dạng streaming)
6. Lắp ghép context: ghép system instruction, lịch sử hội thoại, định nghĩa công cụ
7. LLM inference: hiểu ý định, tạo câu trả lời, gọi công cụ khi cần
8. TTS tổng hợp: chuyển văn bản câu trả lời thành audio (output audio chunk dạng streaming)
9. Downstream audio: client nhận và phát đồng thời
10. Ghi lại trạng thái: ghi lại hội thoại lần này, chuẩn bị context cho vòng tiếp theo

**Điểm mù tần suất cao**: giọng nói thời gian thực không phải đợi người dùng nói xong mới bắt đầu làm việc.

Hệ thống tốt sẽ cố làm trước những gì có thể làm trước:

- Khi người dùng vừa bắt đầu nói, load trạng thái phiên và định nghĩa công cụ trước
- Sau khi ASR có tiền tố ổn định, phán đoán ý định trước
- Khi LLM output câu ngắn đầu tiên, TTS bắt đầu tổng hợp ngay
- Khi gọi công cụ chậm, phát một câu chuyển tiếp tự nhiên trước

Cách làm cốt lõi là **dùng parallel và streaming để ẩn thời gian chờ**.

## Tại sao giọng nói thời gian thực khó hơn đối thoại văn bản nhiều vậy?

Đây là câu hỏi cốt lõi của bài. Hãy phân tích thành năm chiều.

### Khó khăn 1: Ngân sách độ trễ rất chặt

Chat văn bản chậm 1 giây, người dùng thường còn chịu được. Hội thoại giọng nói chậm 1 giây, người dùng sẽ rõ ràng cảm thấy đối phương "không phản hồi".

Độ trễ của một vòng tương tác giọng nói đến từ những khâu này:

| Khâu                   | Thời gian thông thường                               | Hướng tối ưu                                    |
| ---------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Thu âm và mã hóa       | Kích thước audio frame, buffer browser               | Frame nhỏ, giảm buffer vô nghĩa                 |
| Phát hiện endpoint VAD | Đợi im lặng xác nhận người dùng nói xong             | Ngưỡng im lặng động, submit câu ngắn nhanh      |
| ASR                    | Upload audio, decode, ổn định transcription tăng dần | Streaming ASR, hot word, tiền xử lý phía client |
| LLM                    | Độ trễ token đầu, gọi công cụ, context quá dài       | Prompt cache, câu trả lời ngắn, async tool      |
| TTS                    | Tổng hợp chunk đầu, cắt câu dài, inference vocoder   | Tổng hợp streaming cấp câu, warm up giọng       |
| Phát                   | Jitter mạng, decode, buffer player                   | WebRTC jitter buffer, nhận và phát đồng thời    |

Nếu mỗi đoạn thêm 200ms, cả vòng hội thoại ngay lập tức thành "chậm nửa nhịp".

Vì vậy mục tiêu tối ưu giọng nói thời gian thực không phải là đẩy một component nào đó đến giới hạn lý thuyết, mà là **độ trễ P95/P99 end-to-end ổn định**. Người dùng cảm nhận là cả pipeline, không phải benchmark của một mô hình nào đó.

### Khó khăn 2: Xử lý ngắt lời không phải nút tạm dừng

Voice Agent bắt buộc phải hỗ trợ **Barge-in (chen vào ngắt lời)**.

Người dùng nói "đợi đã, không phải ý này", hệ thống cần đồng thời làm nhiều việc:

1. Nhận ra đây là người dùng đang nói, không phải tiếng ồn nền hay echo loa
2. Lập tức dừng hàng đợi phát âm cục bộ, không thể tiếp tục phát hết câu trả lời cũ
3. Hủy luồng LLM và TTS đang sinh trên server
4. Ghi nội dung đã phát, chưa phát, bị ngắt vào trạng thái hội thoại
5. Mở vòng hiểu tiếp theo với audio mới của người dùng

Nhiều hệ thống ngắt lời thất bại, không phải vì VAD không chính xác, mà vì **state machine thiết kế không tốt**. Ví dụ player đã dừng, nhưng TTS server vẫn đang stream; LLM đã dừng, nhưng lịch sử đã ghi câu trả lời chưa phát là "đã nói rồi".

Cách làm của interview-guide:

```typescript
// VoiceInterviewPage.tsx
const handleAudioData = (audioData: string) => {
  // AI 播放时停发音频，避免自己的声音被识别
  if (isAiSpeakingRef.current) {
    return;
  }
  if (wsRef.current && wsRef.current.isConnected()) {
    wsRef.current.sendAudio(audioData);
  }
};
```

Frontend dùng `isAiSpeakingRef` đánh dấu AI có đang nói không, khi đang nói thì ngừng gửi audio. Backend nhận message `control` để hủy sinh.

### Khó khăn 3: Môi trường nhiễu phức tạp hơn môi trường test nhiều

Voice Demo thường chạy trong văn phòng yên tĩnh, nhưng môi trường production có thể là:

- Trong xe, nhà máy, trung tâm thương mại, ga tàu điện ngầm
- Mic xa, người dùng cách thiết bị hai ba mét
- Nhiều người nói cùng lúc
- Người dùng bật ngoài, âm thanh AI lại bị mic thu vào

Điều này ảnh hưởng đến cả pipeline:

- VAD nhầm tiếng ồn với giọng người, gây trigger sai
- ASR chuyển giọng nói nền thành văn bản, làm nhiễu ý định người dùng
- TTS phát bị mic thu, gây tự ngắt lời

Frontend interview-guide đã cấu hình "ba bảo bối" qua `getUserMedia`:

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true, // AEC：消除扬声器回声
    noiseSuppression: true, // NS：压低背景噪声
    autoGainControl: true, // AGC：自动增益，让音量更稳定
    sampleRate: 16000,
  },
});
```

Ba tham số này có thể giải quyết một phần vấn đề, nhưng **đừng quá tin vào chúng**. AEC của WebRTC có hiệu quả hạn chế trong tình huống echo mạnh, NS có thể cắt bớt cả giọng người dùng. Nếu bạn làm giải pháp hardware hoặc App, tiền xử lý audio phía client sẽ trở thành khoản đầu tư kỹ thuật rất thực tế.

### Khó khăn 4: Context không chỉ là lịch sử văn bản

Context của text Agent chủ yếu là lịch sử message. Context của Voice Agent nhiều hơn:

- Người dùng hiện tại có đang nói không
- Câu trả lời lần trước phát đến đâu rồi
- Người dùng đang hỏi bình thường hay đang ngắt lời
- ASR text tăng dần có ổn định không
- Giọng điệu người dùng là nghi vấn, phủ định, do dự hay thiếu kiên nhẫn
- Có tool call nào đang thực thi không

Nếu chỉ feed text ASR cuối cùng cho LLM, nhiều thông tin sẽ bị mất.

Ví dụ người dùng nói "không phải... ý tôi là đơn hàng tháng trước đó", trong văn bản có thể thấy sự sửa chữa, nhưng không thấy anh ta đang ngắt AI; nếu hệ thống không biết câu trả lời lần trước phát đến đâu, rất khó biết người dùng đang phủ định câu nào.

interview-guide dùng kiểu message WebSocket để phân biệt các trạng thái khác nhau:

```typescript
// voiceInterview.ts
export interface WebSocketSubtitleMessage {
  type: "subtitle";
  text: string;
  isFinal: boolean; // true 表示用户已确认提交
}

export interface WebSocketAudioResponseMessage {
  type: "audio";
  data: string; // Base64 音频
  text: string; // 对应的文字
}

export interface WebSocketControlMessage {
  type: "control";
  action: string; // 'submit' | 'cancel' | 'pause'
  data?: Record<string, unknown>;
}
```

Frontend dựa vào `isFinal` để phán đoán người dùng có thực sự nói xong không, tránh nhầm khoảng ngừng giữa chừng của người dùng thành xác nhận.

### Khó khăn 5: Tự ngắt lời do echo

Còn một điểm dễ mắc lỗi tần suất cao: **âm thanh AI đang phát bị mic thu vào, VAD hoặc ASR sẽ phán đoán nhầm là người dùng đang nói, khiến AI tự ngắt lời**.

Cách làm hiện tại của interview-guide:

```typescript
if (isAiSpeakingRef.current) {
  return; // AI 说话时停发音频
}
```

Giải pháp "loại bỏ im lặng" này xác thực tránh được tự ngắt lời, nhưng cái giá là **tín hiệu ngắt lời thực sự của người dùng trong khi AI nói cũng bị chặn**.

Giải pháp tinh tế hơn:

- Khi AI nói tiếp tục nhận audio, nhưng không gửi đến ASR
- Chạy client VAD trên audio sau khi AEC xử lý, không phải raw audio mic
- Dùng ngưỡng năng lượng để phân biệt giọng người dùng (thường > -20dB) và echo residual

### Khó khăn 6: Khả năng phía client quyết định mức tối thiểu trải nghiệm

Nhiều team đặt tất cả năng lực lên cloud, kết quả là trải nghiệm sụp đổ nhanh trong môi trường mạng yếu.

Phía client ít nhất phải đảm nhận những trách nhiệm này:

- Thu âm mic và tiền xử lý audio
- VAD hoặc phát hiện ngắt lời nhẹ
- Buffer phát và hủy phát
- Thông báo và kết nối lại khi mạng gián đoạn

Mô hình cloud quyết định mức tối đa, kỹ thuật phía client quyết định mức tối thiểu. Câu này đặc biệt rõ ràng trong hệ thống giọng nói.

## Nhìn qua interview-guide: Voice Agent cơ bản được triển khai như thế nào?

Đã nói nhiều khái niệm, giờ đến phần thực tế. Tôi lấy dự án interview-guide làm ví dụ, giải thích cách một Voice Agent phỏng vấn cơ bản nhất chạy được.

### Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
├─────────────────────────────────────────────────────────────┤
│  AudioRecorder        WebSocket         VoiceInterviewPage   │
│  - getUserMedia       - sendAudio       - 状态管理          │
│  - AudioWorklet       - sendControl     - 手动提交          │
│  - VAD 检测           - 控制消息         - 分块播放          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     后端 (Spring Boot)                       │
├─────────────────────────────────────────────────────────────┤
│  VoiceInterviewWebSocketHandler                             │
│  - 会话管理（创建、暂停、恢复、结束）                         │
│  - ASR ready / reconnect 状态同步                            │
│  - 音频路由到 ASR，手动 submit 后触发 LLM                     │
│  - LLM 句子流输出，TTS 边合成边推送                           │
├─────────────────────────────────────────────────────────────┤
│  QwenAsrService          DashscopeLlmService      QwenTtsService │
│  - qwen3-asr-flash-      - qwen-max / qwen-plus   - qwen-tts-    │
│    realtime              - 工具调用支持           realtime       │
└─────────────────────────────────────────────────────────────┘
```

### Frontend: Thu âm và VAD

Phần cốt lõi frontend là component `AudioRecorder`. Nó làm những việc sau:

**Bước 1, lấy quyền mic và cấu hình tham số audio:**

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000, // ASR 需要 16kHz
  },
});
```

**Bước 2, khởi tạo client VAD:**

```typescript
const vadInstance = await window.vad.MicVAD.new({
  getStream: async () => stream,
  onSpeechStart: () => {
    onSpeechStart?.(); // 触发回调
  },
  onSpeechEnd: () => {
    onSpeechEnd?.();
  },
});
await vadInstance.start();
```

**Bước 3, dùng AudioWorklet để thu âm theo chunk:**

`onSpeechEnd` của VAD chỉ cho bạn biết người dùng có thể đã nói xong, audio thực tế vẫn cần gửi theo chunk cho server. Cách triển khai của interview-guide:

```typescript
await audioContext.audioWorklet.addModule("/audio-worklet/pcm-processor.js");

const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
workletNode.port.onmessage = (event) => {
  if (!recordingActiveRef.current) {
    return;
  }
  const base64 = arrayBufferToBase64(event.data as ArrayBuffer);
  onAudioData(base64); // 200ms Int16 PCM，发送给后端 ASR
};

source.connect(workletNode);
workletNode.connect(gainNode);
gainNode.connect(audioContext.destination);
```

`pcm-processor.js` chạy trong audio rendering thread, chịu trách nhiệm resample audio Float32 từ browser thành 16kHz, Int16 PCM, và gửi về main thread qua `postMessage` theo từng block 200ms. So với `ScriptProcessorNode` đã deprecated, `AudioWorkletNode` không áp xử lý audio lên UI main thread, nguy cơ độ trễ và giật giảm hơn.

Có một lựa chọn thiết kế ở đây: **tại sao không đợi VAD trigger `onSpeechEnd` rồi mới gửi audio?**

Vì phát hiện VAD có độ trễ, đợi nó xác nhận người dùng nói xong rồi mới bắt đầu gửi audio, sẽ thêm tổng cộng 400-600ms trống. Cách tốt hơn là **liên tục gửi theo chunk**, VAD trigger `onSpeechEnd` chỉ để báo cho backend "đoạn này nói xong rồi, có thể submit cho LLM".

Tuy nhiên, phỏng vấn giọng nói của interview-guide không phải "phát hiện im lặng là tự động submit", mà là **ASR liên tục transcribe, người dùng bấm nút submit thủ công**. Cách này tránh được hệ thống "cướp lời" khi ứng viên ngừng nửa chừng, cũng giải quyết vấn đề trải nghiệm "câu sau ghi đè câu trước": frontend chỉ dùng kết quả ASR làm bản nháp câu trả lời, thực sự vào vòng phỏng vấn tiếp theo được quyết định bởi control message `submit`.

### Frontend: Phát audio

interview-guide dùng hai chế độ phát audio:

**Chế độ 1: HTMLAudioElement (tình huống đơn giản):**

```typescript
// VoiceInterviewPage.tsx
const onAudioResponse = (audioData: string, text: string) => {
  if (audioData && audioData.length > 0) {
    setAiAudio(audioData); // 设置 src，触发自动播放
    setAiText(text);
    setAiSpeaking(true);

    // 设置超时watchdog，防止音频播放异常卡住
    const durationMs = estimateWavDurationMs(audioData);
    audioPlaybackWatchdogRef.current = setTimeout(
      finishAiPlayback,
      Math.min(Math.max(durationMs + 1500, 4000), 60_000),
    );
  }
};
```

**Chế độ 2: AudioContext phát theo chunk (kiểm soát tinh tế hơn):**

```typescript
// 分块处理
const handleAudioChunk = (
  base64Wav: string,
  _index: number,
  isLast: boolean,
) => {
  // 1. 解码 WAV
  const binaryStr = atob(base64Wav);
  const bytes = new Uint8Array(binaryStr.length);
  const pcmOffset = 44;
  const pcmData = new Int16Array(
    bytes.buffer,
    pcmOffset,
    (bytes.length - pcmOffset) / 2,
  );
  const float32 = new Float32Array(pcmData.length);

  // 2. 放入播放队列
  chunkQueueRef.current.push(audioBuffer);
  if (!isChunkPlayingRef.current) {
    playNextChunk();
  }

  // 3. 最后一包或服务端 audio_complete 后，等待队列播完
  if (isLast) {
    scheduleChunkDrainCompletion();
  }
};

// 播放下一块
const playNextChunk = () => {
  if (chunkQueueRef.current.length === 0) {
    isChunkPlayingRef.current = false;
    return;
  }
  const buffer = chunkQueueRef.current.shift()!;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.onended = () => playNextChunk();
  source.start(0);
};
```

Lợi ích của phát theo chunk là **có thể bắt đầu phát nhanh hơn**, không cần đợi toàn bộ file audio tải xong. Nhưng cái giá là độ phức tạp triển khai cao hơn, phải tự quản lý hàng đợi và trạng thái.

Trong implementation mới, server còn push thêm một control message `audio_complete` sau khi tất cả TTS fragment được gửi xong. Như vậy frontend không còn phụ thuộc vào TTS fragment cuối phải có `isLast=true`, kể cả khi một câu TTS tổng hợp thất bại, cũng có thể kết thúc đúng trạng thái "giám khảo đang nói" sau khi các fragment thành công phát xong.

> ⚠️ **Lưu ý**: Browser yêu cầu AudioContext phải được tạo hoặc resume sau tương tác người dùng (autoplay policy). Nếu tạo AudioContext khi page load, hầu hết browser sẽ đặt nó ở trạng thái `suspended`. Khuyến nghị gọi `audioContext.resume()` khi người dùng bấm nút "Bắt đầu phỏng vấn" để đảm bảo phát bình thường.

### Backend: Quản lý phiên WebSocket

Backend quản lý vòng đời phiên qua `VoiceInterviewWebSocketHandler`:

```java
// VoiceInterviewWebSocketHandler.java
public class VoiceInterviewWebSocketHandler {
    // 会话状态：idle -> listening -> thinking -> speaking -> completed
    // 支持：pause（暂停）、resume（恢复）、end（结束）

    // 收到客户端音频
    public void handleAudioMessage(String sessionId, String audioBase64) {
        asrService.sendAudio(sessionId, decodeBase64(audioBase64));
    }

    // 收到客户端控制消息
    public void handleControlMessage(String sessionId, String action, Map data) {
        switch (action) {
            case "submit" -> llmService.triggerResponse(sessionId, data);
            case "cancel" -> cancelCurrentGeneration(sessionId);
            case "pause" -> pauseSession(sessionId);
        }
    }
}
```

State machine phiên của interview-guide:

| Trạng thái  | Ý nghĩa                                                | Có thể chuyển sang |
| ----------- | ------------------------------------------------------ | ------------------ |
| IN_PROGRESS | Phỏng vấn đang tiến hành                               | PAUSED, COMPLETED  |
| PAUSED      | Tạm dừng (người dùng rời trang hoặc chủ động tạm dừng) | IN_PROGRESS        |
| COMPLETED   | Phỏng vấn kết thúc                                     | -                  |

Cơ chế tạm dừng/tiếp tục rất hữu ích. Ví dụ người dùng nghe điện thoại, chuyển tab, có thể tạm dừng phỏng vấn, quay lại tiếp tục liền mạch.

### Backend: ASR service

ASR service backend đóng gói interface DashScope của Alibaba Cloud:

```java
// QwenAsrService.java
public void startTranscription(
    String sessionId,
    Consumer<String> onFinal,
    Consumer<String> onPartial,
    Runnable onReady,
    Consumer<Throwable> onError
) {
    // 1. 建立 WebSocket 连接到 DashScope ASR
    OmniRealtimeConversation conversation = new OmniRealtimeConversation(param, callback);

    // 2. 配置：开启服务端 VAD，400ms 静音判定结束
    OmniRealtimeConfig config = OmniRealtimeConfig.builder()
        .enableTurnDetection(true)
        .turnDetectionSilenceDurationMs(400)
        .build();

    // 3. 注册回调：识别完成时触发
    conversation.updateSession(config);
    asrSession.markReady();
    onReady.run(); // 通知前端 asr_ready
}

public void sendAudio(String sessionId, byte[] audioData) {
    AsrSession session = sessions.get(sessionId);
    if (!session.awaitReady(1200)) {
        throw new IllegalStateException("ASR session not ready");
    }
    String audioBase64 = Base64.getEncoder().encodeToString(audioData);
    session.getConversation().appendAudio(audioBase64);
}
```

Bước này rất quan trọng. Trong phiên bản trước, WebSocket frontend kết nối xong cho phép người dùng bấm mic ngay, nhưng phiên DashScope ASR chưa hoàn toàn sẵn sàng, gây ra vấn đề như "câu đầu nói được, câu hai không thu được". Bây giờ backend chỉ gửi `asr_ready` sau khi `updateSession` hoàn thành, frontend tắt mic trước đó; nếu sau 10 giây vẫn chưa ready, backend sẽ tự động kết nối lại ASR và push `asr_reconnecting` cho frontend.

Khi server trả về kết quả nhận dạng, Handler push text tăng dần cho frontend:

```java
// WebSocket 推送增量文字
websocket.sendMessage(new WebSocketSubtitleMessage(
    "subtitle",
    transcript,
    isFinal  // true 表示这是最终结果
));
```

### Backend: TTS service

```java
// QwenTtsService.java
public byte[] synthesize(String text) {
    CountDownLatch latch = new CountDownLatch(1);
    ByteArrayContainer audioContainer = new ByteArrayContainer();

    QwenTtsRealtime qwenTts = new QwenTtsRealtime(param, callback);
    qwenTts.connect();

    // 配置音色和参数
    QwenTtsRealtimeConfig config = QwenTtsRealtimeConfig.builder()
        .voice(voice)  // 如 "Cherry"
        .responseFormat(QwenTtsRealtimeAudioFormat.PCM_24000HZ_MONO_16BIT)
        .speechRate(speechRate)
        .build();

    qwenTts.updateSession(config);
    qwenTts.appendText(text);
    qwenTts.commit();

    // 等待音频块接收完成
    latch.await(30, TimeUnit.SECONDS);
    return audioContainer.toByteArray();
}
```

Sau khi Handler lấy được dữ liệu PCM, chuyển thành WAV push cho frontend:

```java
// LLM 每输出一个完整句子，就提交给并发 TTS 队列
OrderedTtsChunkEmitter chunkEmitter = new OrderedTtsChunkEmitter(session, semaphore);
llmService.chatStreamSentences(userText, sentence -> {
    chunkEmitter.submit(sentence);
});

// TTS 分片按句子顺序推送，最后发送 audio_complete 控制消息
chunkEmitter.finish();
chunkEmitter.awaitCompletion();
```

Điểm mấu chốt ở đây không phải "tổng hợp toàn bộ câu trả lời một lần", mà là **LLM vừa sinh câu, TTS vừa tổng hợp, frontend vừa phát**. Backend dùng `max-concurrent-tts-per-session` kiểm soát số TTS đồng thời mỗi phiên, dùng `tts-timeout-seconds` tránh một câu nào đó chặn cả vòng phát; nếu tất cả TTS cấp câu đều thất bại, lùi về tổng hợp toàn bộ văn bản để backup.

## Làm thế nào để Voice Agent hỗ trợ ngắt lời?

Ngắt lời là điểm khó tần suất cao của Voice Agent. Hãy giải thích rõ ràng.

### Ba tầng ý nghĩa của ngắt lời

1. **Tầng phát**: khi người dùng nói, dừng phát audio hiện tại
2. **Tầng sinh**: hủy LLM và TTS đang sinh trên server
3. **Tầng context**: ghi lại chính xác nội dung đã phát và chưa phát

Logic ngắt lời của interview-guide:

```typescript
// 前端：检测到用户说话时停止播放
const handleAudioData = (audioData: string) => {
  // AI 正在说话时，不发音频给后端
  if (isAiSpeakingRef.current) {
    return; // 静默丢弃，不触发打断逻辑
  }
  wsRef.current.sendAudio(audioData);
};

// 音频播放完成时
const finishAiPlayback = () => {
  aiAudioPendingRef.current = false;
  clearAudioPlaybackWatchdog();
  setAiSpeaking(false);
  setIsSubmitting(false);

  // 只有真正播放完的内容才能写入"已说"上下文
  commitAiMessage(aiTextRef.current.trim());
};
```

Thiết kế then chốt là: ngắt lời không phải "tạm dừng", mà là "hủy bỏ". Nội dung đã phát được ghi là "đã nói", nội dung chưa phát không được ghi.

### Ngắt lời từ góc độ state machine

Nhìn từ góc độ state machine, ngắt lời là một sự kiện điều khiển có thể vào từ gần như bất kỳ trạng thái nào:

| Trạng thái hiện tại | Người dùng ngắt lời   | Phản hồi đúng                                     |
| ------------------- | --------------------- | ------------------------------------------------- |
| listening           | Người dùng chen vào   | Loại bỏ audio hiện tại, bắt đầu nhận dạng lại     |
| thinking            | Người dùng bổ sung    | Hủy inference hiện tại, trigger lại với input mới |
| speaking            | Người dùng chen vào   | Dừng phát, xóa hàng đợi                           |
| tool_calling        | Người dùng nói "thôi" | Hủy gọi công cụ, hoặc dừng thông báo tiếp theo    |

Nếu hệ thống không có ngữ nghĩa hủy rõ ràng, rất nhanh sẽ xuất hiện trải nghiệm lộn xộn "AI vừa nghe câu hỏi mới, vừa đang phát câu trả lời cũ".

## Browser audio capture và tiền xử lý đóng vai trò gì trong hệ thống giọng nói?

Nhiều bài viết coi WebRTC như "tiêu chuẩn cho cuộc gọi audio-video trên browser", giải thích rất trừu tượng. Nói chính xác hơn là: browser cung cấp một bộ khả năng **thu âm và tiền xử lý audio**, Voice Agent chủ yếu dùng `getUserMedia` API.

**Phân biệt quan trọng**:

- **Media Capture and Streams API** (`getUserMedia`): chịu trách nhiệm thu âm từ mic, có thể cấu hình tiền xử lý AEC/NS/AGC. Đây là thứ interview-guide thực sự sử dụng.
- **WebRTC protocol** (RTCPeerConnection): chịu trách nhiệm truyền tải thời gian thực end-to-end, bao gồm ICE, DTLS-SRTP, RTP và các protocol khác. Bạn mới cần cái này nếu dùng OpenAI Realtime API (chế độ WebRTC) hoặc Azure Voice Live.

Pipeline audio của interview-guide là:

```
getUserMedia → AudioWorklet → Base64 编码 → WebSocket 发送
```

Tầng truyền tải của pipeline này là **WebSocket (TCP)**, không phải **RTP (UDP)** của WebRTC. WebSocket đảm bảo thứ tự nhưng có thể có độ trễ TCP retransmission; UDP của WebRTC nhanh hơn nhưng mất gói không retransmit.

### Pipeline tiền xử lý audio của browser

Trong Voice Agent, bạn chủ yếu dùng những khả năng tiền xử lý audio browser này:

```
麦克风输入
    │
    ▼
┌─────────────────────────┐
│  AEC (回声消除)          │  消除扬声器播放的声音
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  NS (噪声抑制)            │  压低背景噪声
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  AGC (自动增益控制)       │  让音量更稳定
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  VAD (语音活动检测)       │  判断是否有人声
└─────────────────────────┘
    │
    ▼
编码输出
```

### Lựa chọn cấu hình getUserMedia

interview-guide dùng cấu hình `getUserMedia` cơ bản nhất:

```typescript
navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,
  },
});
```

Nhưng đây không phải lựa chọn duy nhất, các tình huống khác nhau có sự đánh đổi khác nhau:

| Tham số          | true                                                 | false                                           | Khuyến nghị                                 |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| echoCancellation | Khử echo loa, nhưng mất một phần chất lượng âm       | Giữ nguyên chất lượng âm, nhưng phải tự làm AEC | Bật                                         |
| noiseSuppression | Giảm nhiễu, nhưng có thể cắt bớt giọng người dùng    | Phải tự làm NS                                  | Bật khi môi trường ồn, tắt khi yên tĩnh     |
| autoGainControl  | Tự điều chỉnh âm lượng về mức phù hợp                | Phụ thuộc âm lượng mic gốc                      | Bật                                         |
| sampleRate       | Càng cao chất lượng càng tốt, nhưng dữ liệu càng lớn | 16kHz đủ cho ASR                                | ASR dùng 16kHz, output TTS có thể cần 24kHz |

**Một điểm dễ mắc lỗi tần suất cao**: khả năng AEC của WebRTC khác nhau đáng kể trên các browser và thiết bị khác nhau. Phiên bản desktop Chrome hiệu quả tốt, nhưng Safari và mobile có thể kém xa. Nếu bạn làm ứng dụng production, khuyến nghị **test hiệu quả AEC trên nhiều thiết bị và browser**.

### Hạn chế của WebRTC

WebRTC phù hợp cho tình huống browser, nhưng nếu bạn làm App hoặc giải pháp hardware, nó không nhất thiết phù hợp.

Mobile native development có thể dùng:

- **iOS**: AVAudioEngine + xử lý audio tích hợp hệ thống
- **Android**: AudioRecord + Oboe/AAudio, hoặc dùng thư viện WebRTC của Google

Tình huống hardware (loa thông minh, xe hơi) thường cần chip DSP chuyên dụng cho tiền xử lý frontend, giải pháp software của WebRTC không đáp ứng được yêu cầu về độ trễ và tiêu thụ điện.

## Pipeline cascade và mô hình realtime native có ưu nhược điểm gì?

Đây là câu hỏi cốt lõi khi lựa chọn.

### Giải pháp 1: ASR + LLM + TTS cascade

```
音频 -> VAD -> 流式 ASR -> LLM -> 流式 TTS -> 音频
```

Ưu điểm:

- Text ASR có thể lưu DB, audit, sửa lỗi
- Input/output LLM đều là text, dễ tái sử dụng framework Agent hiện có
- TTS có thể thay thế độc lập giọng và nhà cung cấp
- Mỗi component có thể load test và tối ưu riêng

Nhược điểm:

- Mỗi tầng đều có độ trễ
- Lỗi ASR truyền xuống LLM
- Tầng trung gian văn bản mất giọng điệu, ngừng nghỉ, cảm xúc
- Ngắt lời cần hủy đồng nhất qua ASR, LLM, TTS, player

interview-guide dùng giải pháp này. Phù hợp cho: hỏi đáp kiến thức doanh nghiệp, ticket dịch vụ khách hàng, hệ thống nghiệp vụ cần audit tuân thủ.

### Giải pháp 2: Realtime Speech-to-Speech native

```
音频 -> 原生多模态模型 -> 音频
```

Giải pháp tiêu biểu: OpenAI Realtime API, Gemini Live API, Alibaba Tongyi Qwen-Omni.

Ưu điểm:

- Độ trễ end-to-end thấp hơn
- Giữ lại nhiều thông tin cạnh ngôn ngữ như giọng điệu, ngừng nghỉ, cảm xúc
- Có thể xử lý đồng nhất audio input, text event, gọi công cụ

Nhược điểm:

- Quá trình trung gian hộp đen hơn, định vị vấn đề phụ thuộc log nhà cung cấp nhiều hơn
- Audit văn bản và kiểm soát kịch bản cần thiết kế thêm
- Mô hình chi phí có thể tính theo audio token hoặc thời lượng
- Nếu nghiệp vụ phụ thuộc mạnh vào private deployment, API nhà cung cấp chưa chắc đáp ứng

**Lựa chọn phương thức kết nối**:

OpenAI Realtime API hỗ trợ ba phương thức kết nối:

| Phương thức kết nối | Phù hợp với                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------- |
| WebRTC              | Ứng dụng browser và mobile, khả năng NAT traversal và chống jitter tốt hơn                |
| WebSocket           | Tình huống middleware server-to-server, độ trễ thấp và kiểm soát được                     |
| SIP                 | Tích hợp hệ thống điện thoại VoIP, phù hợp call center, dịch vụ khách hàng qua điện thoại |

### Khuyến nghị của tôi

Sản phẩm giọng nói tần suất cao, thời gian thực mạnh, cảm giác tự nhiên mạnh, ưu tiên đánh giá Realtime API native. Tình huống nghiệp vụ tuân thủ mạnh, audit mạnh, kiểm soát mạnh, pipeline cascade ổn định hơn.

**Đừng làm end-cloud hybrid ngay từ ngày đầu**. Hãy chạy thông một pipeline trước, rồi dần dần thay thế.

## Làm thế nào để tối ưu hệ thống giọng nói trong production?

Nói về một số điểm tối ưu thực chiến.

### 1. Giảm audio frame và độ phân giải submit

Audio thời gian thực thường chia frame 10ms, 20ms, 30ms. Frame quá lớn độ trễ cao, frame quá nhỏ overhead mạng lớn.

Lựa chọn của interview-guide là **chunk 200ms**:

```typescript
// pcm-processor.js
this.targetSampleRate = 16000;
this.samplesPerChunk = 3200; // 200ms at 16kHz
```

Điều này có nghĩa là sau khi người dùng nói xong một câu, nhanh nhất 400-600ms sau server mới có thể bắt đầu nhận dạng. Độ trễ này có thể chấp nhận, nhưng nếu muốn tốt hơn, có thể:

- Giảm chunk xuống 100ms
- Frontend gửi một đoạn nhỏ trước để ASR "khởi động nóng"
- Dùng kết quả tăng dần của server-side VAD làm input streaming cho LLM

### 2. Cho LLM nói câu ngắn trước

Câu trả lời giọng nói không phải viết bài. Người dùng không cần nghe đầy đủ 500 chữ ngay từ đầu.

Chiến lược tốt hơn:

- Output câu xác nhận trước: "Để tôi xem"
- Phát câu chuyển tiếp trong lúc gọi công cụ: "Đang tra đơn hàng gần nhất"
- Đưa kết luận sau khi tra xong
- Giải thích dài cắt thành nhiều câu, mỗi câu có thể tổng hợp độc lập

### 3. TTS cắt theo ranh giới ngữ nghĩa

TTS cắt quá vụn nghe đứt gãy; cắt quá dài độ trễ chunk đầu cao.

Khuyến nghị cắt theo thứ tự ưu tiên:

1. Dấu chấm, chấm hỏi, chấm than
2. Chấm phẩy, dấu hai chấm
3. Cụm từ dấu phẩy dài
4. Câu quá dài buộc phải cắt

Đồng thời tránh cắt hỏng số, từ viết tắt tiếng Anh, tên code. Ví dụ "GPT-4o-mini-tts" không thể bị cắt tùy tiện thành mấy đoạn đọc.

interview-guide hiện tại áp dụng ý tưởng này: trong quá trình LLM streaming output, chỉ cần phát hiện một câu hoàn chỉnh, lập tức submit cho `OrderedTtsChunkEmitter` để làm TTS cấp câu. Frontend nhận được `audio_chunk` thì vào hàng đợi phát ngay, nhận được `audio_complete` thì đợi hàng đợi phát tự nhiên hết. Như vậy âm thanh đoạn đầu không cần đợi toàn bộ câu trả lời sinh và tổng hợp xong.

### 4. Kiểm soát độ dài context

Voice Agent rất dễ nhồi tất cả transcription, kết quả công cụ, trạng thái phát vào context. Ngắn hạn không sao, trong hội thoại dài sẽ khiến độ trễ và chi phí cùng tăng.

Khuyến nghị chia context thành ba tầng:

- **Văn bản gốc ngắn hạn**: transcription và câu trả lời đầy đủ vài vòng gần nhất
- **Tóm tắt phiên**: mục tiêu người dùng, sự thật đã xác nhận, việc chưa hoàn thành
- **Trạng thái sự kiện**: tiến độ phát hiện tại, có bị ngắt không, kết quả gọi công cụ

LLM không cần biết mọi audio frame xảy ra gì, nó cần biết trạng thái tỷ lệ tín hiệu-nhiễu cao liên quan đến quyết định hiện tại.

### 5. Observability toàn pipeline

interview-guide dùng Redis làm cache trạng thái phiên:

```java
// VoiceInterviewService.java
private static final String SESSION_CACHE_KEY_PREFIX = "voice:interview:session:";

private void cacheSession(VoiceInterviewSessionEntity session) {
    String cacheKey = getSessionCacheKey(session.getId());
    RBucket<VoiceInterviewSessionEntity> bucket = redissonClient.getBucket(cacheKey);
    bucket.set(session, Duration.ofHours(CACHE_TTL_HOURS));
}
```

Môi trường production còn cần ghi lại:

- Thời lượng audio upstream
- Thời lượng giọng người hữu ích
- ASR token hoặc số phút
- Input/output token LLM
- Số ký tự TTS, số giây audio, số giây bị ngắt
- Độ trễ end-to-end và số lần hủy mỗi vòng

Không có những chỉ số này, chi phí Voice Agent rất khó hội tụ.

## Voice Agent có thể phát triển như thế nào?

interview-guide là phiên bản cơ bản nhất, còn nhiều chỗ có thể tối ưu.

### End-cloud hybrid

Hiện tại interview-guide về cơ bản là thiết kế "lấy cloud là chính". Hướng nâng cao là đưa nhiều khả năng hơn xuống phía client:

| Khâu | Hiện tại                     | Hướng phát triển                                            |
| ---- | ---------------------------- | ----------------------------------------------------------- |
| VAD  | Client VAD + Server-side VAD | Thuần client VAD, giảm tải server                           |
| ASR  | Thuần cloud                  | Lệnh đơn giản ở client, nhận dạng phức tạp ở cloud          |
| LLM  | Thuần cloud                  | Model nhỏ backup ở client, dùng được khi mất mạng           |
| TTS  | Thuần cloud                  | Âm thanh gợi ý cố định ở client, hội thoại tự nhiên ở cloud |

Cốt lõi của end-cloud hybrid là **đặt tối đa các khả năng thời gian thực mạnh, nhạy cảm với privacy, cần backup khi mất mạng ở phía client**.

### Triển khai mô hình cục bộ

Nếu bạn có yêu cầu về tuân thủ dữ liệu, có thể xem xét triển khai cục bộ ASR và TTS:

- **ASR**: faster-whisper, FunASR, SenseVoice
- **TTS**: piper1-gpl (Piper gốc đã được archive), Fish Speech, CosyVoice

**Lưu ý**: repo Piper gốc (rhasspy/piper) đã được archive vào tháng 10 năm 2025, phát triển đã chuyển sang [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl). Nhưng cần chú ý hai điểm: (1) piper1-gpl dùng giấy phép GPL-3.0, khi sử dụng trong dự án thương mại cần đánh giá yêu cầu tuân thủ open source; (2) dự án hiện đang tuyển người bảo trì mới, hỗ trợ dài hạn còn bất định. Nếu giấy phép không tương thích, có thể xem xét Fish Speech (Apache 2.0) hoặc CosyVoice và các giải pháp thay thế khác.

Ưu điểm của triển khai cục bộ là kiểm soát được, offline được. Nhược điểm là **chi phí kỹ thuật cao**: GPU/memory/capacity concurrent phải tự load test, streaming inference, model hot loading, thu hồi VRAM đều phải tự làm.

### Realtime API native

Nếu bạn thấy độ trễ và trải nghiệm của pipeline cascade không đủ tốt, có thể đánh giá Realtime API native:

- OpenAI **gpt-realtime** (GA tháng 8 năm 2025, hỗ trợ MCP/hình ảnh/SIP)
- Gemini Live API
- Alibaba Tongyi Qwen-Omni

Các API này hợp nhất ASR, LLM, TTS thành một mô hình đa phương thức thống nhất, lý thuyết độ trễ thấp hơn, trải nghiệm tự nhiên hơn. Nhưng cái giá là **hộp đen hơn, đắt hơn, khó debug hơn**.

OpenAI Realtime API đã chính thức GA, ra mắt model chuyên dụng **gpt-realtime**, cải thiện đáng kể trong tuân thủ instruction phức tạp, gọi công cụ, biểu đạt giọng nói tự nhiên. Đồng thời bổ sung ba khả năng mới:

1. **Hỗ trợ remote MCP server**, có thể gọi công cụ bên ngoài như giải pháp cascade;
2. **Hỗ trợ image input**, mô hình có thể kết hợp nội dung màn hình người dùng đang xem để hội thoại;
3. **Tích hợp điện thoại SIP**, hỗ trợ kết nối với mạng điện thoại truyền thống.

Về giá, gpt-realtime giảm giá 20% so với phiên bản preview (input $32/1M token, output $64/1M token).

### Tối ưu trải nghiệm ngắt lời

Hiện tại ngắt lời của interview-guide là "loại bỏ im lặng": âm thanh người dùng trong khi AI nói bị bỏ hoàn toàn. Cách này đơn giản, nhưng trải nghiệm chưa đủ tự nhiên.

Cách làm tốt hơn:

- Khi AI nói tiếp tục nhận audio, nhưng không gửi đến ASR
- Sau khi phát hiện giọng người dùng, giảm dần âm lượng AI (fade out thay vì dừng đột ngột)
- Giữ lại context nội dung đã phát sau khi ngắt lời

### Mở rộng đa phương thức

Hiện tại interview-guide chỉ có giọng nói. Có thể mở rộng thành:

- **Giọng nói + chia sẻ màn hình**: giám khảo có thể xem IDE của ứng viên
- **Giọng nói + camera**: xem biểu cảm và ngôn ngữ cơ thể ứng viên
- **Giọng nói + bảng trắng**: cùng vẽ sơ đồ kiến trúc

Những khả năng đa phương thức này cần quản lý stream và đồng bộ trạng thái phức tạp hơn.

## Trả lời câu hỏi về hệ thống giọng nói AI trong phỏng vấn như thế nào?

Nếu giám khảo hỏi: "Bạn thiết kế một Voice Agent thời gian thực như thế nào?"

Có thể trả lời theo hướng này:

1. **Trước tiên phân tích pipeline**: client thu audio, VAD phán đoán ranh giới nói, ASR streaming transcription, LLM hiểu ý định và gọi công cụ, TTS streaming synthesis, client nhận và phát đồng thời.
2. **Sau đó nói khó khăn**: khó khăn cốt lõi của giọng nói thời gian thực là độ trễ end-to-end, ngắt lời người dùng, môi trường nhiễu, trạng thái context và phối hợp end-cloud.
3. **Tiếp theo nói state machine**: cần quản lý các trạng thái listening, thinking, speaking, interrupted, khi ngắt lời phải hủy phát, hủy sinh, và xử lý context đã phát và chưa phát.
4. **Cuối cùng nói lựa chọn**: API đám mây ra mắt nhanh, model cục bộ kiểm soát được nhưng chi phí kỹ thuật cao, end-cloud hybrid phù hợp production, tình huống trải nghiệm thời gian thực mạnh có thể đánh giá Speech-to-Speech API.

Tóm gọn một câu:

**Cốt lõi của Voice Agent AI không phải là "nhận dạng giọng nói + mô hình lớn + tổng hợp giọng nói", mà là xây dựng một hệ thống hội thoại có thể hủy, có thể quan sát, có thể degradation xung quanh luồng audio thời gian thực.**

## Tổng kết

Công nghệ giọng nói AI trông có vẻ là ghép nối vài module ASR, TTS, VAD, nhưng khi thực sự triển khai, thử thách là khả năng kỹ thuật hệ thống.

Điểm cốt lõi cần nhớ:

1. **Pipeline cơ bản**: Voice Agent thời gian thực ít nhất bao gồm thu âm, tiền xử lý, VAD, ASR, LLM, gọi công cụ, TTS, phát streaming và ghi lại trạng thái.
2. **Khó khăn thời gian thực**: độ trễ, ngắt lời, nhiễu, context và khả năng phía client là năm yếu tố dễ đưa Demo trở về điểm xuất phát nhất.
3. **Lựa chọn kiến trúc**: ASR + LLM + TTS cascade kiểm soát được, dễ audit; Speech-to-Speech native độ trễ thấp, trải nghiệm tự nhiên; end-cloud hybrid là sự thỏa hiệp phổ biến trong production.
4. **Trọng tâm kỹ thuật**: nhất định phải thiết kế state machine, ngữ nghĩa hủy, xác nhận phát, trace toàn pipeline và chỉ số chi phí.
5. **Nguyên tắc lựa chọn**: dùng khả năng cloud chạy thông vòng lặp trước, sau đó dần dần thay thế model cục bộ hoặc khả năng phía client dựa trên chi phí, tuân thủ, độ trễ và nhu cầu private.

Tóm lại: **trải nghiệm người dùng của Voice Agent không phải do model một mình quyết định, mà do cả pipeline thời gian thực cùng quyết định**. Model chịu trách nhiệm thông minh, kỹ thuật chịu trách nhiệm không xảy ra sự cố. Thiếu một trong hai đều không được.

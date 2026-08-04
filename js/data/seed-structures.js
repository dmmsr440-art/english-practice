// ATSU 表現・構文厳選120選 — 構造化データ（作業用中間ファイル）
// category: "beginner"(初級30) | "advanced"(中上級30) | "expr1" | "expr2" | "expr3"
// 各構文: { number, category, subtag, pattern, meaning, examples:[{en, ja}] }

export const STRUCTURES = [
  // ===== ペラペラになるための重要構文30選【初級編】 =====
  { number: 1, category: "beginner", pattern: "It's [形容詞] to do", meaning: "〜するのは形容詞だ", examples: [
    { en: "It's important to exercise every day.", ja: "毎日運動することは重要だ。" },
    { en: "It's fun to study English.", ja: "英語を勉強するのは楽しい。" },
  ]},
  { number: 2, category: "beginner", pattern: "It's [形容詞] that [文]", meaning: "文は形容詞だ", examples: [
    { en: "It's impressive that you speak English so well.", ja: "そんなに英語を上手に話せるなんてすごいね。" },
    { en: "It's surprising that you finished this so quickly.", ja: "こんなに早く終わらせるなんてびっくりだよ。" },
    { en: "It's interesting that you said that.", ja: "そんなこと言うなんて面白いね。" },
  ]},
  { number: 3, category: "beginner", pattern: "X is so [形容詞] that [文]", meaning: "X はとても形容詞だから文だ", examples: [
    { en: "It was so good that I couldn't stop eating.", ja: "美味しすぎて止まらなかった。" },
    { en: "It was so expensive that I didn't buy it.", ja: "めっちゃ高かったから買わなかった。" },
  ]},
  { number: 4, category: "beginner", pattern: "X is too [形容詞] to do", meaning: "X は形容詞すぎて〜できない", examples: [
    { en: "I'm too tired to go out.", ja: "疲れすぎて出掛けられない。" },
  ]},
  { number: 5, category: "beginner", pattern: "X is [形容詞] enough to do", meaning: "〜するには X は十分形容詞だ", examples: [
    { en: "I'm not confident enough to speak English in public.", ja: "人前で話せるほど英語に自信がない。" },
    { en: "It's fast enough to watch YouTube.", ja: "YouTube見れるくらいインターネット速いよ。" },
  ]},
  { number: 6, category: "beginner", pattern: "find it [形容詞] to do", meaning: "〜することは形容詞だと思う", examples: [
    { en: "I find it really interesting to study English.", ja: "英語を勉強するのはすごく面白いと思う。" },
    { en: "I find it very difficult to speak in public.", ja: "人前で話すのはすごく難しいと思う。" },
  ]},
  { number: 7, category: "beginner", pattern: "[文] so that [文]", meaning: "文のために文する", examples: [
    { en: "I'm trying to save money so that I can travel abroad.", ja: "海外旅行できるように節約してる。" },
    { en: "I want to study English so that I can make more friends.", ja: "もっと友達を作れるように英語を勉強したい。" },
  ]},
  { number: 8, category: "beginner", pattern: "[否定文] + at all", meaning: "全く + 否定文", examples: [
    { en: "I don't like English at all.", ja: "英語が全く好きじゃない。" },
    { en: "I'm not surprised at all.", ja: "全く驚いてないよ。" },
  ]},
  { number: 9, category: "beginner", pattern: "X is the same as Y", meaning: "X は Y と同じだ", examples: [
    { en: "Your phone is the same as mine. It's iPhone 14, right?", ja: "携帯、私のと同じだ。iPhone 14 だよね？" },
    { en: "Your taste in fashion is the same as mine.", ja: "ファッションの好み、私と同じだね。" },
  ]},
  { number: 10, category: "beginner", pattern: "Just because [文] doesn't mean [文]", meaning: "文だからといって文だとは限らない", examples: [
    { en: "Just because it looks good doesn't mean it's delicious.", ja: "見た目が良いからといって美味しいとは限らない。" },
    { en: "Just because he smiles a lot doesn't mean he's kind.", ja: "いつも笑顔だからといって親切な人とは限らない。" },
  ]},
  { number: 11, category: "beginner", pattern: "X is not necessarily [形容詞]", meaning: "X は必ずしも形容詞ではない", examples: [
    { en: "Expensive clothes are not necessarily fashionable.", ja: "高い服が必ずしもオシャレとは限らない。" },
    { en: "Being able to speak English doesn't necessarily mean they are smart.", ja: "英語が喋れるからといって必ずしも賢いわけではない。" },
  ]},
  { number: 12, category: "beginner", pattern: "X used to do", meaning: "X はよく〜していた", examples: [
    { en: "I used to play soccer.", ja: "昔はよくサッカーしていた。" },
    { en: "I used to live in Tokyo.", ja: "昔は東京に住んでいた。" },
    { en: "It used to take 20 minutes.", ja: "昔は20分かかっていた。" },
  ]},
  { number: 13, category: "beginner", pattern: "X is used to [名詞/動名詞]", meaning: "X は名詞/動名詞に慣れている", examples: [
    { en: "I'm already used to speaking English.", ja: "もう英語を話すのに慣れてるよ。" },
    { en: "I used to be very nervous, but I'm already used to it.", ja: "昔はめっちゃ不安だったけどもう慣れてるよ。" },
  ]},
  { number: 14, category: "beginner", pattern: "X is not as [形容詞] as I expected/thought", meaning: "X は思ったほど形容詞じゃない", examples: [
    { en: "The food was not as delicious as I expected.", ja: "期待してたほど美味しくなかった。" },
    { en: "He didn't speak English as fluently as I expected.", ja: "期待してたほど彼は英語を流暢に話さなかった。" },
  ]},
  { number: 15, category: "beginner", pattern: "spend [時間] doing", meaning: "〜することに時間を費やす", examples: [
    { en: "I usually spend about 8 hours studying English.", ja: "普段、8時間くらい英語の勉強してる。" },
    { en: "I spent 2 hours practicing the guitar yesterday.", ja: "昨日は2時間ギターの練習をした。" },
  ]},
  { number: 16, category: "beginner", pattern: "feel like doing", meaning: "〜したい気分だ", examples: [
    { en: "I feel like working out today.", ja: "今日はエクササイズしたい気分だ。" },
    { en: "I don't feel like doing anything today.", ja: "今日は何もしたくない気分だ。" },
  ]},
  { number: 17, category: "beginner", pattern: "[文] as soon as [文]", meaning: "文するとすぐに文", examples: [
    { en: "Give me a call as soon as you get here.", ja: "ここに着いたらすぐに電話して。" },
    { en: "I'll send it to you as soon as I finish the meeting.", ja: "ミーティングが終わったらすぐに送るよ。" },
  ]},
  { number: 18, category: "beginner", pattern: "I don't know if [文]", meaning: "文かどうかわからない", examples: [
    { en: "I don't know if he's coming.", ja: "彼が来るかどうかわからない。" },
    { en: "I don't know if they have Wi-Fi.", ja: "あの店にWi-Fiがあるかどうかわからない。" },
  ]},
  { number: 19, category: "beginner", pattern: "I wonder if [文]", meaning: "文かどうかなと思う", examples: [
    { en: "I wonder if he's coming.", ja: "彼は来るのかな。" },
    { en: "I wonder if they have Wi-Fi.", ja: "あの店にWi-Fiあるのかな。" },
  ]},
  { number: 20, category: "beginner", pattern: "It's been [時間] since [文]", meaning: "文してから時間が経っている", examples: [
    { en: "It's been 2 years since I last saw him.", ja: "彼に最後に会ってから2年になる。" },
    { en: "It's been a while.", ja: "久しぶりだね。" },
    { en: "It's been a long time.", ja: "久しぶりだね。" },
  ]},
  { number: 21, category: "beginner", pattern: "It takes [時間] to do", meaning: "〜するのに時間がかかる", examples: [
    { en: "It takes about 40 minutes to get there.", ja: "あそこに着くのに大体40分かかる。" },
    { en: "How long did it take?", ja: "どのくらい時間かかったの？" },
    { en: "It took about 40 minutes.", ja: "私がそれをやるのには大体40分くらいかかった。" },
    { en: "It took me about 40 minutes.", ja: "私がそれをやるのには大体40分くらいかかった。" },
    { en: "It took him about 40 minutes.", ja: "彼がそれをやるのには大体40分くらいかかったよ。" },
  ]},
  { number: 22, category: "beginner", pattern: "How about + [文]", meaning: "文はどう？", examples: [
    { en: "How about you do it?", ja: "あなたがそれをやるのはどう？" },
    { en: "How about we host a party?", ja: "パーティーを一緒に主催するのはどう？" },
    { en: "How about we do it together?", ja: "一緒にやるのはどう？" },
  ]},
  { number: 23, category: "beginner", subtag: "使役動詞", pattern: "have X do", meaning: "X に〜(どうにかして)させる", examples: [
    { en: "I'll have Taka do it.", ja: "それはたかにやってもらうよ。" },
  ]},
  { number: 24, category: "beginner", subtag: "使役動詞", pattern: "get X to do", meaning: "X に〜(どうにかして)させる", examples: [
    { en: "I'll get Taka to do it.", ja: "それはたかにやってもらうよ。" },
  ]},
  { number: 25, category: "beginner", subtag: "使役動詞", pattern: "make X do", meaning: "X に〜(強制的に)させる", examples: [
    { en: "I'll make Taka do it.", ja: "それはたかにやらせるよ。" },
    { en: "It made me think.", ja: "考えさせられた。" },
    { en: "What made you come to Japan?", ja: "なぜ日本に来たんですか？" },
  ]},
  { number: 26, category: "beginner", subtag: "使役動詞", pattern: "let X do", meaning: "X に〜させてあげる", examples: [
    { en: "I'll let him do it.", ja: "それは彼にやらせてあげるよ。" },
    { en: "I'll let you know when I figure out.", ja: "わかったら教えてあげるね。" },
    { en: "Let me help you.", ja: "手伝わせて。" },
    { en: "Let me do it for you.", ja: "私にやらせて。" },
  ]},
  { number: 27, category: "beginner", pattern: "make X [形容詞]", meaning: "X を形容詞にさせる", examples: [
    { en: "I want to make him happy.", ja: "彼を喜ばせたい。" },
    { en: "I want to make the world a better place.", ja: "世界をもっと良くしたい。" },
    { en: "That makes my life easier.", ja: "人生が楽になるわ。" },
  ]},
  { number: 28, category: "beginner", subtag: "知覚動詞", pattern: "see X doing", meaning: "X が〜しているのを見る", examples: [
    { en: "I saw him singing yesterday.", ja: "昨日、彼が歌っているのを見た。" },
    { en: "I saw a lot of people walking in the city.", ja: "街で多くの人が歩いているのを見た。" },
  ]},
  { number: 29, category: "beginner", subtag: "知覚動詞", pattern: "hear X doing", meaning: "X が〜しているのを聞く", examples: [
    { en: "I heard so many people talking about it.", ja: "多くの人がそのことについて話しているのを聞いた。" },
    { en: "I've never heard him speaking English.", ja: "彼が英語を話しているのを聞いたことがない。" },
  ]},
  { number: 30, category: "beginner", pattern: "what [主語] [動詞]", meaning: "主語が動詞すること", examples: [
    { en: "What I like about it is this.", ja: "私が好きなのはこれです。" },
    { en: "That's not what I mean.", ja: "そういう意味じゃないよ。" },
  ]},

  // ===== ペラペラになるための重要構文30選【中・上級編】 =====
  { number: 31, category: "advanced", pattern: "you know how [文]", meaning: "ほら、文じゃん？", examples: [
    { en: "You know how he seems really happy?", ja: "ほら、彼っていつも幸せそうじゃん？" },
    { en: "You know how I'm always complaining about this kind of stuff?", ja: "ほら、私っていつもこういうことに関して文句言ってるじゃん？" },
    { en: "You know how I've been looking for a new jacket?", ja: "ほら、私ずっと新しいジャケットを探してるって言ってたじゃん？" },
  ]},
  { number: 32, category: "advanced", pattern: "If you could do, that would be [形容詞]", meaning: "もし〜してくれたら、形容詞だ", examples: [
    { en: "If you could finish writing that report by the end of today, that would be great.", ja: "もしそのレポートを今日中に書き終えてくれたら、最高だよ。" },
    { en: "If you could come, that would be awesome.", ja: "もし来れるなら、めちゃくちゃ嬉しい。" },
    { en: "If you could do that, that would be impressive.", ja: "もしそれできるならめちゃくちゃすごいよ。" },
  ]},
  { number: 33, category: "advanced", pattern: "for the first time in [時間]", meaning: "時間ぶりに", examples: [
    { en: "I played tennis for the first time in 5 years.", ja: "5年ぶりにテニスをした。" },
    { en: "I came to Osaka for the first time in 10 years.", ja: "10年ぶりに大阪に来た。" },
    { en: "I bought a new jacket for the first time in ages.", ja: "久しぶりに新しいジャケットを買った。" },
    { en: "I came here for the first time in ages.", ja: "久しぶりにここに来た。" },
  ]},
  { number: 34, category: "advanced", pattern: "what if [文]", meaning: "もし文ならどうする？", examples: [
    { en: "What if it rains tomorrow?", ja: "明日、雨降ったらどうする？" },
    { en: "What if they don't like it?", ja: "もし好きじゃなかったらどうする？" },
    { en: "What if the profit was zero?", ja: "もし利益がゼロだったらどうする？" },
    { en: "What if the profit is zero?", ja: "もし利益がゼロだったらどうする？" },
  ]},
  { number: 35, category: "advanced", pattern: "That's why [文]", meaning: "だから文だ", examples: [
    { en: "That's why I don't like it.", ja: "だからそれ嫌いなんだよ。" },
    { en: "That's why I really hate the cafe.", ja: "だからそのカフェめっちゃ嫌いなんだよ。" },
    { en: "That's why it's very important to study English now.", ja: "だから今英語の勉強をするのはすごく大事なんだよ。" },
  ]},
  { number: 36, category: "advanced", pattern: "It feels like [文]", meaning: "文な気がする", examples: [
    { en: "It feels like something's going to happen.", ja: "何か起こりそうな気がする。" },
    { en: "It feels like it's going to rain.", ja: "雨が降りそうな気がする。" },
    { en: "It feels like something is off about this presentation.", ja: "このプレゼン、なんか変な気がする。" },
    { en: "It feels like he's been just slacking off.", ja: "彼、最近ダラダラしてる気がする。" },
  ]},
  { number: 37, category: "advanced", pattern: "There's no way [文]", meaning: "文なんてありえない", examples: [
    { en: "There's no way she's 50. She looks so young.", ja: "彼女が50歳なんてありえない。めちゃくちゃ若く見える。" },
    { en: "There's no way he said that.", ja: "彼がそんなこと言ったなんてありえない。" },
    { en: "There's no way it's already 2 am. Crazy.", ja: "もう2時なんてありえない。やばい。" },
  ]},
  { number: 38, category: "advanced", pattern: "I'm not sure if [文]", meaning: "文かどうか分からない", examples: [
    { en: "I'm not sure if he is coming.", ja: "彼が来るかどうか分からない。" },
    { en: "So I'm not sure if he's coming today.", ja: "今日来るかどうか分からない。" },
    { en: "I'm not sure if it's true.", ja: "それが本当かどうか分からない。" },
    { en: "Sorry, I'm not sure if I can make it.", ja: "ごめん、間に合うかどうか分からない。" },
  ]},
  { number: 39, category: "advanced", pattern: "What's the point of doing", meaning: "〜することに何の意味があるの？", examples: [
    { en: "What's the point of doing that?", ja: "それやって何の意味があるの？" },
    { en: "What's the point of working out?", ja: "筋トレすることに何の意味があるの？" },
    { en: "What's the point of studying English?", ja: "英語の勉強することに何の意味があるの？" },
  ]},
  { number: 40, category: "advanced", pattern: "It's [形容詞] how [文]", meaning: "文は形容詞だ", examples: [
    { en: "It's interesting how life changes so quickly.", ja: "人生ってこんなに色々と変わっていくの面白いよね。" },
    { en: "It's strange how we never met before.", ja: "私たち一回も会わなかったなんてなんか変な感じだね。" },
    { en: "Isn't it interesting how we haven't done this before?", ja: "これ一緒にやったことないって面白くない？" },
  ]},
  { number: 41, category: "advanced", pattern: "be supposed to do", meaning: "本来であれば〜することになっている", examples: [
    { en: "I'm supposed to be on a diet.", ja: "ダイエットしてるはずなんだけどな。" },
    { en: "I'm supposed to be on a diet, but these cakes are amazing.", ja: "ダイエットしてるはずなんだけど、このケーキ美味しすぎる。" },
    { en: "What am I supposed to be doing here?", ja: "私は何をすべきでしょうか？" },
  ]},
  { number: 42, category: "advanced", pattern: "The reason I do sth is...", meaning: "〜するのは〜だからだ", examples: [
    { en: "The reason I study English is to be able to communicate with people from all different backgrounds.", ja: "色々なバックグラウンドの人とコミュニケーションを取りたいから英語の勉強をしている。" },
    { en: "The reason I like her is because she's very intelligent.", ja: "彼女のことが好きなのは、めちゃくちゃ知的だからなんだよね。" },
  ]},
  { number: 43, category: "advanced", pattern: "the more [文], the more [文]", meaning: "文すればするほど文になる", examples: [
    { en: "The more you listen, the more you learn.", ja: "聞けば聞くほど、勉強になる。" },
    { en: "The more you practice, the better you get.", ja: "練習すればするほど、上手くなる。" },
    { en: "The more you learn, the better you get.", ja: "学べば学ぶほど、上手くなる。" },
    { en: "The more, the better.", ja: "多ければ多いほどいい。" },
    { en: "The more, the merrier.", ja: "大勢の方が楽しい。" },
  ]},
  { number: 44, category: "advanced", pattern: "It's just that [文]", meaning: "ただ文なだけ", examples: [
    { en: "Oh, it's just that I'm tired.", ja: "あぁ、ただ疲れてるだけだよ。" },
    { en: "It's just that I was busy.", ja: "ただ忙しかっただけだよ。" },
  ]},
  { number: 45, category: "advanced", pattern: "I'll probably do", meaning: "きっと〜するだろう", examples: [
    { en: "I'll probably be able to make it.", ja: "きっと間に合うと思う。" },
    { en: "I'll probably just stay at home and chill.", ja: "多分家でゆっくりする。" },
    { en: "I'll probably just go to the supermarket but that's it. Nothing else planned.", ja: "多分ただスーパーに行くくらいで他には特に予定ないよ。" },
  ]},
  { number: 46, category: "advanced", pattern: "it's not that [文]", meaning: "文という訳ではない", examples: [
    { en: "It's not that I hate studying.", ja: "勉強が嫌いという訳ではない。" },
    { en: "It's not that I hate studying. It's just that I didn't want to study today.", ja: "勉強が嫌いという訳ではないんだよ。今日はただ勉強したくなかっただけ。" },
    { en: "It's not that I don't drink coffee. I just wanted to drink tea today.", ja: "コーヒーを飲まない訳ではないんだけど今日はお茶を飲みたかったんだよね。" },
    { en: "It's not that I'm allergic to it. I just don't like the smell of it.", ja: "アレルギーがある訳ではないんだけど匂いが好きじゃないんだよね。" },
  ]},
  { number: 47, category: "advanced", pattern: "without doing", meaning: "〜することなしで", examples: [
    { en: "He's funny without even trying.", ja: "彼って笑わせようとしてなくても面白いよね。" },
    { en: "I can't start my day without drinking coffee.", ja: "コーヒーを飲まずに1日を始めるなんて無理だよ。" },
    { en: "I can't start my day without drinking coffee. My brain won't function without coffee.", ja: "コーヒーを飲まずに1日を始めるなんて無理だよ。コーヒーなしでは脳が機能しない。" },
    { en: "He left without saying goodbye.", ja: "さよならを言わずに彼は行ってしまった。" },
  ]},
  { number: 48, category: "advanced", pattern: "It's said that [文]", meaning: "文と言われる", examples: [
    { en: "It's said that everything happens for a reason.", ja: "全てのことは理由があって起きると言われている。" },
    { en: "It's said that Atsueigo is the best channel on YouTube.", ja: "AtsueigoがYouTube上で一番良いチャンネルだと言われている。" },
  ]},
  { number: 49, category: "advanced", pattern: "If I were to do, I would do", meaning: "仮に〜するとしたら、〜するだろう", examples: [
    { en: "If I were to travel this year, I would go to Paris.", ja: "もし今年旅行するとしたら、パリに行くだろうな。" },
    { en: "If I were to study abroad, it would be probably about two years.", ja: "もし留学するとしたら、きっと2年間くらいになると思う。" },
  ]},
  { number: 50, category: "advanced", pattern: "It's such a [形容詞] [名詞] that [文]", meaning: "ものすごく形容詞な名詞だったので文だった", examples: [
    { en: "It was such a hot day that we couldn't go outside.", ja: "めちゃくちゃ暑い日だったから外出することができなかった。" },
    { en: "It was such a cozy cafe that I could spend hours there.", ja: "めちゃくちゃ居心地良いカフェだから何時間でも過ごせるよ。" },
  ]},
  { number: 51, category: "advanced", pattern: "I'm at the stage where [文]", meaning: "文の段階にある", examples: [
    { en: "I'm at the stage where I need to think about my life more carefully.", ja: "もう少し自分の人生について気をつけて考えないといけない段階にある。" },
    { en: "I'm at the stage where I need to accumulate more experience.", ja: "もっと経験を積まないといけない段階にある。" },
    { en: "I'm at the stage where I need to study English more seriously.", ja: "もっと真面目に英語を学ばないといけない段階にある。" },
  ]},
  { number: 52, category: "advanced", pattern: "X is worth doing", meaning: "〜は〜する価値がある", examples: [
    { en: "This book is worth reading.", ja: "この本は読む価値がある。" },
    { en: "This video is worth watching.", ja: "この動画は観る価値がある。" },
    { en: "It's worth watching this video.", ja: "この動画は観る価値がある。" },
  ]},
  { number: 53, category: "advanced", pattern: "What I like about X is Y", meaning: "X に関して好きなところは Y だ", examples: [
    { en: "What I like about Japan is its beautiful culture.", ja: "日本の好きなところは美しい文化だよ。" },
    { en: "What I like about this channel is that I can learn a lot of things.", ja: "このチャンネルの好きなところは色々なことについて学べるところだよ。" },
  ]},
  { number: 54, category: "advanced", pattern: "X is like, [文]", meaning: "文と言った、思った", examples: [
    { en: "He was like, \"Why do you complain so much?\"", ja: "「なんでそんなに文句ばっかり言うの？」って彼は言ってたよ。" },
    { en: "I was like, \"Why wouldn't he shut his mouth?\"", ja: "「なんで彼は口を閉じないんだよ」って感じだった。" },
    { en: "He was asking me so many questions so I was like, \"Just do whatever you want.\"", ja: "彼、めちゃくちゃ質問してきたから「もう好きなことやれば？」って感じだった。" },
  ]},
  { number: 55, category: "advanced", pattern: "in which case [文]", meaning: "もしそうなったら文", examples: [
    { en: "I might be late tomorrow, in which case I'll send you a message.", ja: "明日遅れるかもしれないからその場合、連絡するね。" },
    { en: "He might be on vacation, in which case just contact John.", ja: "彼は休暇中かもしれないからもしそうなったらジョンに連絡して。" },
  ]},
  { number: 56, category: "advanced", pattern: "when it comes to [名詞/動名詞]", meaning: "名詞/動名詞のことになると", examples: [
    { en: "When it comes to coffee, he's an expert.", ja: "コーヒーのことになると彼はエキスパートだよ。" },
    { en: "When it comes to traffic in this city, it's a nightmare.", ja: "この街の交通量に関して言えば、悪夢だよ。" },
    { en: "When it comes to studying, consistency is the key.", ja: "勉強に関して言えば、一貫してやり続けることが重要だよ。" },
  ]},
  { number: 57, category: "advanced", pattern: "with [名詞] [状態]", meaning: "名詞が状態の状態で", examples: [
    { en: "I can even do this with my eyes closed.", ja: "目閉じてでもこれできるよ。" },
    { en: "My dog was sleeping with his tongue hanging out.", ja: "私の犬は舌を出した状態で寝てた。" },
    { en: "It's so hard to type with my hands shaking.", ja: "両手が震えた状態でタイピングするのは難しい。" },
  ]},
  { number: 58, category: "advanced", pattern: "[動詞] how [形容詞] [名詞] is", meaning: "名詞がどれだけ形容詞なのか動詞", examples: [
    { en: "Look how beautiful this city is.", ja: "この街、どれだけ美しいか見てよ。" },
    { en: "Look how beautiful she is.", ja: "彼女、どれだけ美しいか見てよ。" },
    { en: "Do you remember how crazy the party was?", ja: "あのパーティーどれだけやばかったか覚えてる？" },
  ]},
  { number: 59, category: "advanced", pattern: "get to do", meaning: "〜する機会がある、〜することができる", examples: [
    { en: "This morning, I got to drive a new car.", ja: "今朝、新車を運転できた。" },
    { en: "Because of work, I don't get to work out as much as I used to.", ja: "仕事のせいで、昔ほど筋トレできてない。" },
    { en: "Yesterday, I got to talk with a famous actor.", ja: "昨日、あの有名な俳優と話す機会があったんだよ。" },
  ]},
  { number: 60, category: "advanced", pattern: "be going to have to do", meaning: "残念ながら〜しないといけない", examples: [
    { en: "Unfortunately, you're going to have to leave now.", ja: "残念ながら、もう出てもらわないといけない。" },
    { en: "Yeah, probably, you're going to have to pay for it.", ja: "きっとそれ払わないといけないだろうね。" },
    { en: "Probably, I'm going to have to knuckle down and study.", ja: "そろそろ本気出して勉強しないといけないんだろうな。" },
  ]},

  // ===== ATSUがよく使う表現20選 Part 1 =====
  { number: 61, category: "expr1", pattern: "It's [形容詞] how [文]", meaning: "文は形容詞だ", note: "ある状況や事実についての驚きや強調を表現する時に使います。how が that 節と同じ意味で使われているのが面白いですね。", examples: [
    { en: "It's interesting how you said that.", ja: "そんなこと言うなんて面白いね。" },
    { en: "It's amazing how you did that.", ja: "そんなことしたなんてすごいね。" },
    { en: "It's amazing how we can work on this project.", ja: "このプロジェクトに取り組めるなんてすごいね。" },
    { en: "It's strange how time flies when we're having fun.", ja: "楽しんでる時、時間過ぎるのがめっちゃ早く感じるのって変だよね。" },
  ]},
  { number: 62, category: "expr1", pattern: "at the end of the day", meaning: "結局は", note: "直訳すると「その日の最後に」となり、そこから最終的に、結局のところという意味で使われます。", examples: [
    { en: "At the end of the day, this is not that important.", ja: "結局のところ、これってそんなに重要じゃないよね。" },
    { en: "At the end of the day, what I'm saying doesn't really matter because the choice is yours.", ja: "結局のところ、選ぶのは君なんだから私の言ってることなんてどうでもいいんだよ。" },
    { en: "At the end of the day, you don't have to think about it because you're not going to do it.", ja: "結局やらないんだから考えなくていいよ。" },
  ]},
  { number: 63, category: "expr1", pattern: "if that makes sense", meaning: "言ってること分かる？", note: "直訳すると「もしそれが理解されるなら」となり、自分の言葉が相手に理解されているかを確認する時によく使います。", examples: [
    { en: "Well, it sounded a little bit British, but at the same time, maybe a bit Australian, if that makes sense.", ja: "イギリス英語とオーストラリア英語が混ざった感じだったとは思うんだけど、言ってること分かる？" },
    { en: "I want something cold, but at the same time, you know, maybe warmish if that makes sense.", ja: "何か冷たいけど、温かいみたいなものが欲しいんだよな。言ってること分かる？" },
  ]},
  { number: 64, category: "expr1", pattern: "if you think about it", meaning: "考え方によれば", note: "ある事実や意見を深く考えると、という意味で使います。「よくよく考えると〜だ」のように、気づきがある時に使える表現です。", examples: [
    { en: "We're just tiny specks in the universe if you think about it.", ja: "考え方によれば、私たちなんて宇宙のこれっぽっちの存在にしか過ぎないよね。" },
    { en: "It's crazy how we can communicate like this if you think about it.", ja: "考えてみると、こんな風にやり取りできるのってすごいよね。" },
  ]},
  { number: 65, category: "expr1", pattern: "you know what I mean?", meaning: "言ってること分かる？", note: "「what + 主語 + 動詞」は「主語が動詞すること」という意味になります。ゆえに、「私が意味することがわかる？」という意味になり、相手が自分の言っていることを理解しているかを確認する時に使います。", examples: [
    { en: "I think YouTube is getting more and more competitive, you know what I mean?", ja: "YouTubeって競争がますます激しくなってるよね。言ってること分かる？" },
    { en: "At the end of the day, whether or not you should study English is completely up to you. You know what I mean?", ja: "結局のところ、勉強するかしないかは完全に君次第だよ。言ってること分かる？" },
  ]},
  { number: 66, category: "expr1", pattern: "or so", meaning: "〜とかその辺、大体", note: "期間や時間、金額などに対して、「約、大体」という意味で使われます。", examples: [
    { en: "I think it's going to start in 10 minutes or so.", ja: "大体あと10分くらいで始まると思う。" },
    { en: "It's 20 dollars or so.", ja: "大体20ドルとかその辺だよ。" },
    { en: "It's going to cost probably 20 dollars or so.", ja: "大体20ドルとかそのくらいかかるよ。" },
  ]},
  { number: 67, category: "expr1", pattern: "and stuff", meaning: "〜とか", note: "stuff はぼんやりと「もの」を表し、ゆえに本表現は「など」という意味で使われます。", examples: [
    { en: "We've got to do editing and stuff.", ja: "編集とかしないといけないじゃん。" },
    { en: "We've got to do editing and stuff. I think it's going to cost probably 20 dollars or so.", ja: "編集とかしないといけないじゃん。20ドルとかそのくらいかかるよ。" },
  ]},
  { number: 68, category: "expr1", pattern: "something like that", meaning: "〜とかなんとか", note: "like には「〜のような」と言う意味があり、ゆえに本表現は「そのようなもの」という意味になります。or something like that のように、or とあわせて使われることが多いです。", examples: [
    { en: "He said he was going to study English or something like that.", ja: "英語を勉強するとかなんとか言ってたよ。" },
    { en: "I think he's learning Spanish or something like that.", ja: "彼はスペイン語かなんかを勉強してると思う。" },
    { en: "I think he's learning Spanish or something like that, if that makes sense.", ja: "彼はスペイン語かなんかを勉強してると思う。言ってること分かる？" },
  ]},
  { number: 69, category: "expr1", pattern: "pretty much", meaning: "ほぼ", note: "「ほとんど、大体」という意味で使います。almost と同じ意味ですね。", examples: [
    { en: "This is pretty much done (completed).", ja: "これはほぼ終わってるよ。" },
    { en: "This is pretty much the same as that one.", ja: "あれとほぼ同じだね。" },
  ]},
  { number: 70, category: "expr1", pattern: "or not really?", meaning: "ちょっと違う？", note: "相手に質問をした後に、「それともそれはちょっと違うかな？」と付け加える時に使います。", examples: [
    { en: "Do you like this kind of music, or not really?", ja: "こういう感じの音楽好き？それともちょっと違う？" },
    { en: "Is this what you're looking for, or not really?", ja: "これ君が探してるもの？それともちょっと違う？" },
    { en: "Is this a kind of thing that you wanted to do, or not really?", ja: "これ君がしたいと思ってた感じのこと？それともちょっと違う？" },
  ]},
  { number: 71, category: "expr1", pattern: "I have a feeling", meaning: "〜という気がする", note: "〜という感じがする、と自分の直感や予感を表現する時に使います。I have a hunch that という形も同様によく使われます。", examples: [
    { en: "I have a feeling that it's going to be a great event.", ja: "めっちゃ良いイベントになる気がする。" },
    { en: "I have a feeling that we're going to win.", ja: "勝つ気がする。" },
    { en: "I have a feeling that there's more to it.", ja: "もっとなんかあるんじゃないかという気がする。" },
    { en: "Do you have a feeling that we're going to win, or not really?", ja: "私たちが勝つと思う？それともそうでもない？" },
  ]},
  { number: 72, category: "expr1", pattern: "I know, right?", meaning: "ほんとそれ", note: "相手の意見に強く同意する時に使います。日本語の「ほんとそれ！」という感覚に近いですね。", examples: [
    { en: "Oh my god, this is delicious. — I know, right?", ja: "やばい、これ美味しすぎる。／ ほんとそれ。" },
    { en: "Oh my god, she is gorgeous. — I know, right?", ja: "あの人めっちゃ綺麗だね。／ ほんとそれ。" },
    { en: "Oh my god, he did a great job. — I know, right?", ja: "彼めっちゃ良い仕事したね。／ ほんとそれ。" },
    { en: "This is beautiful. — I know, right?", ja: "これ綺麗だね。／ ほんとそれ。" },
  ]},
  { number: 73, category: "expr1", pattern: "kind of thing", meaning: "〜みたいなもの", note: "「〜みたいなもの」という意味で、自分が使う名詞を少し曖昧にしたい時に使われます。同じ意味で a ... sort of thing と言うこともできます。", examples: [
    { en: "I was trying to create something like my original anime kind of thing.", ja: "オリジナルのアニメみたいなものを作ろうとしてたんだよね。" },
    { en: "This is a flip phone kind of thing but a bit different.", ja: "この携帯はガラケーみたいなものなんだけどちょっと違うんだよね。" },
    { en: "I'm trying to create a YouTube channel kind of thing but on a different platform.", ja: "他のプラットフォームなんだけどYouTubeチャンネルみたいなものを作ろうとしてるんだよね。" },
  ]},
  { number: 74, category: "expr1", pattern: "in which case", meaning: "その場合", note: "その場合、という意味で使われ、その直前の自分の発言に対して使われる表現です。", examples: [
    { en: "The data might not be available tomorrow, in which case, I've got to get you to do it.", ja: "明日データが使えないかもしれないからその場合、君にやってもらわないといけない。" },
    { en: "The museum might be closed tomorrow, in which case, we can go to the cafe over there.", ja: "明日美術館が閉まってるかもしれないからその場合、あそこのカフェに行こう。" },
  ]},
  { number: 75, category: "expr1", pattern: "even if", meaning: "たとえ〜だったとしても", note: "「たとえ〜でも」、という意味で、ある条件下であっても何かが起こることを示す時に使う定番の表現です。", examples: [
    { en: "Even if it rains, we've got to do it.", ja: "たとえ雨でも、やらないといけない。" },
    { en: "I have a feeling that even if it rains, he's going to try to do it.", ja: "たとえ雨でも、彼はやろうとする気がする。" },
    { en: "I think he was pretty much saying that even if it rains, we've got to do it.", ja: "彼はたとえ雨でもやらないといけないということを大体言っていた。" },
  ]},
  { number: 76, category: "expr1", pattern: "simply put", meaning: "簡単に言えば", note: "if it is simply put の if it is が省略された形と考えると分かりやすいです。「もしそれがシンプルに置かれると＝簡単に言うと」と意味が発展しており、複雑な事柄を簡潔に説明する時に使います。to put it simply もよく使われますよ。", examples: [
    { en: "Simply put, he doesn't like sports.", ja: "簡単に言えば、彼はスポーツが好きじゃない。" },
    { en: "Simply put, I'm not interested.", ja: "簡単に言えば、興味がない。" },
    { en: "Hey, how was the event? — Simply put, it was a disaster.", ja: "イベントどうだった？／ 簡単に言えば、最悪だったよ。" },
  ]},
  { number: 77, category: "expr1", pattern: "let's say", meaning: "仮に〜としよう", note: "「〜と言ってみよう」というニュアンスから、「例えば」という意味で使われるようになった表現です。ある状況や例を示す時に使います。", examples: [
    { en: "Let's say I invest a hundred dollars now, how much will I be able to make in a year?", ja: "仮に今100ドルを投資したとしたら1年でどれくらい稼げるの？" },
    { en: "Let's say you were given the chance.", ja: "仮に君にチャンスが回ってきたとしよう。" },
  ]},
  { number: 78, category: "expr1", pattern: "That's true", meaning: "確かにそうだね", note: "それは正しい、という意味で、相手の意見や事実に同意する時に使います。自分は違う意見を持っているが、とりあえず相手の意見を肯定しておきたい時にも使える便利な表現です。", examples: [
    { en: "I think we've got to look at it from a different angle. — Yeah, that's true.", ja: "別の角度からも見ないといけないと思う。／ 確かにそうだね。" },
    { en: "Don't you think? — Yeah, that's true.", ja: "そう思わない？／ 確かにそうだね。" },
  ]},
  { number: 79, category: "expr1", pattern: "instead of", meaning: "〜じゃなくて", note: "「〜の代わりに、〜じゃなくて」という意味で、あるものや行動の代替を示す時に使います。of は前置詞なので、動詞をとる時は doing の形を続けましょう（例：We decided to go to the park instead of staying at home）。", examples: [
    { en: "I think instead of trying to make a killing in the first year, I think we should first focus on the quality.", ja: "1年目は大儲けしようとするんじゃなくて、まずはクオリティに専念した方が良いと思う。" },
    { en: "We decided to chill at home instead of going out.", ja: "出掛けるんじゃなくて家でゆっくりすることにした。" },
  ]},
  { number: 80, category: "expr1", pattern: "rather than", meaning: "〜よりもむしろ", note: "〜よりもむしろ、という意味で、2つの選択肢の中で優先するものを示す時に使います。文頭に Rather だけ持ってきて、「むしろ」という意味で使うこともできます。", examples: [
    { en: "I think you should study pronunciation first rather than spending too much time on learning vocabulary.", ja: "単語学習に時間を使いすぎるよりも、むしろまず発音の勉強した方が良いと思う。" },
    { en: "Instead of buying a new one, I think you should repair your old one rather than wasting money.", ja: "新しいものを買ってお金を無駄遣いするより、むしろ古いものをお直しした方が良いと思う。" },
  ]},

  // ===== ATSUがよく使う表現20選 Part 2 =====
  { number: 81, category: "expr2", pattern: "the reason being", meaning: "理由は", note: "前述の自分の発言に対して理由を述べるときに使う表現です。the reason is ... と同じ意味で使われる表現で、分詞構文が元になった表現ですが、頻出なのでフレーズとして覚えてしまいましょう。", examples: [
    { en: "I made the decision not to join the program. The reason being I thought I wasn't ready yet and didn't have the competence enough to do it.", ja: "プログラムに参加しないことにした。理由は、自分にはまだその準備ができてないし、それをこなすだけの実力もないと思ったから。" },
  ]},
  { number: 82, category: "expr2", pattern: "as to", meaning: "〜に関して", note: "「〜に関して」という意味で使われる表現で、about と比べると若干フォーマルな表現です。口語でも使える表現です。", examples: [
    { en: "I want to make a decision as to which university I want to attend next year.", ja: "来年どの大学に進学するか決めたい。" },
    { en: "I want to have a discussion as to what we need to do in the next couple of months.", ja: "今後数カ月で何をすべきか議論したい。" },
    { en: "I want to have a discussion as to which university is the best university.", ja: "どの大学がベストなのか議論したい。" },
  ]},
  { number: 83, category: "expr2", pattern: "whereas", meaning: "一方で", note: "「一方で」という意味で使われる表現です。but をかっこよく置き換える表現として考えると使いやすいです。", examples: [
    { en: "I think your skill to communicate is really important, whereas there are some people who say that it's not as important as it used to be.", ja: "コミュニケーションスキルは本当に重要だと思うけど、一方で以前ほど重要ではないと言う人もいる。" },
    { en: "He likes learning from textbooks, whereas I like learning on the job because I think it's way more efficient.", ja: "彼は座学が好きだけど、私は仕事で学ぶ方がもっと効率的で好き。" },
  ]},
  { number: 84, category: "expr2", pattern: "whether or not", meaning: "〜かどうか", note: "「〜かどうか」という意味で使われ、この後には英文が続きます。Whether you like it or not のように、英文の最後に or not を使うこともできます。", examples: [
    { en: "Whether or not you like it doesn't matter because at the end of the day, he calls the shots.", ja: "結局のところ彼に決定権があるから、君がそれを好きかどうかはどうでもいい。" },
  ]},
  { number: 85, category: "expr2", pattern: "what's it called", meaning: "なんていうんだっけ", note: "It is called A で「それはAと呼ばれる」という意味になります。本表現はこのAの部分を問う疑問文なので、what is it called となります。日常会話でよく使われるので、フレーズとして覚えてしまいましょう。", examples: [
    { en: "He was talking about this book, what's it called, Distinction.", ja: "彼は本の話してたんだけど、なんていう名前だっけな。あ、Distinctionだ。" },
    { en: "I was reading this book... What's it called?", ja: "本読んでたんだけど、なんていう名前だっけ。" },
    { en: "What's it called? Oh, Atsueigo! Yeah, yeah. That's the one.", ja: "なんていうんだっけ。あ、Atsueigo! それだ。" },
  ]},
  { number: 86, category: "expr2", pattern: "what's the point of doing", meaning: "〜の目的は何", note: "point は「目的」という意味を持ち、ゆえに「〜することの目的は何？」という意味になります。of doing の部分を省略して What's the point?（目的は何？そんなことしてどうするの？）だけで使うことも多いです。", examples: [
    { en: "I was like, what's the point of doing this? What are we getting out of this?", ja: "これの目的って一体何なの？これから何が得られるの？って感じだったよ。" },
    { en: "What's the point of doing this? I was like, I wanted to find a reason as to why we've got to do this, but you know, nobody else seemed to care.", ja: "これの目的って何なの？これをやらないといけない理由を知りたいわって感じだったけど、他の人は別に気にしてなさそうだった。" },
  ]},
  { number: 87, category: "expr2", pattern: "That's a fair point", meaning: "確かにそうだね", note: "相手の意見や発言に対して同意を示す時に使われる表現です。Part1で紹介した That's true の代替表現として覚えておきましょう。", examples: [
    { en: "I think we've got to consider this as well. — Oh, that's a fair point.", ja: "これも考慮しないといけないと思うよ。/ あ、確かにそうだね。" },
    { en: "I think we've got to do this as well. — Yeah, that's a fair point.", ja: "これもやらないといけないと思うよ。/ あ、確かにそうだね。" },
    { en: "I think this is very important too. — Yeah, that's a fair point. That's true.", ja: "これもすごく大事だと思うよ。/ あ、そうだね。確かに確かに。" },
  ]},
  { number: 88, category: "expr2", pattern: "come across", meaning: "〜に出会う、見つける", note: "あるものを横切る（＝across）イメージから、「人に出会う、物に出合う」という意味で使われます。意図的ではなく、偶然見つける感覚が強い表現です。", examples: [
    { en: "I came across this book at the bookstore.", ja: "本屋でこの本に出合った。" },
    { en: "I came across an old friend on the street.", ja: "道で昔の友達に出会った。" },
    { en: "I came across this information on the internet.", ja: "ネットでこの情報を見つけた。" },
  ]},
  { number: 89, category: "expr2", pattern: "going back to", meaning: "〜に戻ると", note: "If I go back to の If I の部分が省略され、go が going に変形した分詞構文です。前に話されていたトピックや質問などに話題を戻す時によく使われます。", examples: [
    { en: "Going back to your question, my answer is no.", ja: "さっきの君の質問に戻ると、答えはノーだ。" },
    { en: "Going back to your question, my answer is simply put no.", ja: "さっきの君の質問に戻ると、簡単に言えば、答えはノーだ。" },
  ]},
  { number: 90, category: "expr2", pattern: "in this case", meaning: "この場合は", note: "ここでの case は「場合・状況」という意味で使われており、ゆえに「この場合の中では＝この場合・状況では」という意味になります。", examples: [
    { en: "In this case, I think we need to take a different approach.", ja: "この場合、別のアプローチが必要だと思う。" },
    { en: "Oh, that's a fair point. But in this case, I think we should take a different approach.", ja: "確かにそうだね。でもこの場合は、別のアプローチをするべきだと思う。" },
    { en: "That's a fair point, that's true, but in this case, it doesn't matter because...", ja: "確かにそうだね。でもこの場合は関係ないと思う。だって…" },
    { en: "In this case, it doesn't matter. The reason being...", ja: "この場合は関係ないと思う。だって…" },
  ]},
  { number: 91, category: "expr2", pattern: "more about", meaning: "〜の方がもっと重要だ", note: "直訳すると「（〜よりも）どちらかというと（＝more）〜に関するものだ（＝about）」となり、そこから「〜の方がもっと重要だ」という意味になります。例文の that's important という部分はその重要性を強調する役割を果たしています。", examples: [
    { en: "The first stage is more about understanding the concept.", ja: "最初の段階では概念を理解する方が重要だよ。" },
    { en: "The first stage is more about understanding the concept rather than understanding the mechanism of it.", ja: "最初の段階では構造を理解するよりも概念を理解する方が重要だよ。" },
    { en: "This web page is more about its aesthetics that's important.", ja: "このウェブページは、美しさの方がもっと重要なんだよ。" },
    { en: "This web page is more about its aesthetics that's important than its content.", ja: "このウェブページは、内容より美しさの方がもっと重要なんだよ。" },
    { en: "This web page is more about its aesthetics that's important than what we can do with it.", ja: "このウェブページは、それで何ができるかより美しさの方がもっと重要なんだよ。" },
  ]},
  { number: 92, category: "expr2", pattern: "for the sake of", meaning: "〜のために", note: "sake は「目的」という意味を持ち、ゆえに for the sake of は「〜の目的のために＝〜のために」となります。do sth for the sake of doing sth（〜するために〜する＝〜自体が目的化している）という形もよく使われます。", examples: [
    { en: "I don't understand why we've got to do this for the sake of a dollar.", ja: "たった1ドルのために、なんでこんなことしないといけないのか理解できない。" },
    { en: "For the sake of clarity, let me explain this again.", ja: "明確にするために、これもう一回説明させて。" },
    { en: "I started feeling like I was doing it for the sake of doing it.", ja: "それをやること自体が目的化してるような感じになり始めちゃったんだよね。" },
  ]},
  { number: 93, category: "expr2", pattern: "like you said", meaning: "あなたが言ったように", note: "ここでの like は「〜のように」という意味の接続詞で、ゆえに「あなたが言ったように」となります。", examples: [
    { en: "Like you said, this is one of the biggest problems.", ja: "君が言ったように、これは一番大きな問題の一つだね。" },
    { en: "Going back to the topic, I think we've got to make a decision as to what we've got to do about this because, like you said, this is one of the biggest issues.", ja: "さっきの話題に戻ると、君が言ったようにこれは一番大きな問題の一つだから、何をすべきか決めないといけないと思う。" },
  ]},
  { number: 94, category: "expr2", pattern: "this might be just me, but", meaning: "これは私だけかもしれないけど", note: "ある考えや意見に関して、「もしかしたらこう思うのは自分だけなのかもしれないけど」と、自分の主張の強さを弱める時に使います。", examples: [
    { en: "This might be just me, but don't you think this is a bit too expensive?", ja: "こう思うの私だけかもしれないけど、これちょっと高すぎじゃない？" },
    { en: "This might be just me, but don't you think this is a bit too bright?", ja: "こう思うの私だけかもしれないけど、これちょっと明るすぎじゃない？" },
    { en: "This might be just me, but I don't find it interesting.", ja: "私だけかもしれないけど、面白いと思わない。" },
    { en: "This might be just me, but this video is just not interesting.", ja: "こう思うの私だけかもしれないけど、この動画別に面白くない。" },
    { en: "This might be just me, but I find it really funny.", ja: "私だけかもしれないけど、すごく面白いと思った。" },
  ]},
  { number: 95, category: "expr2", pattern: "get to the point", meaning: "要点を言う", note: "get to は「〜にたどり着く」という意味なので、そこから「ポイントにたどり着く＝要点を言う」という意味になります。Just get straight to the point（とにかく要点だけ言って）のように、強調のために straight が入ることも多いです。", examples: [
    { en: "I wish this guy would just get to the point.", ja: "この人、早く要点を言ってくれればいいのに。" },
    { en: "Just get straight to the point.", ja: "もう端的に要点を言ってくれ。" },
  ]},
  { number: 96, category: "expr2", pattern: "end up doing", meaning: "最終的に〜することになる", note: "直訳すると「〜すること（＝doing）で終了する（＝end up）」となり、そこから「結局〜する」となります。end up (as) sth（最終的に〜になる）という形も頻繁に使われます（例：I'm studying accounting at my university, but I don't want to end up as an accountant. 大学で会計を勉強しているんだけど、会計士で終わりたくはないんだ）。", examples: [
    { en: "I was such a couch potato when I was a uni student, but I ended up regretting it.", ja: "大学生の時、めちゃくちゃダラダラしてたけど、結局後悔した。" },
    { en: "I didn't want to go to the party, but I ended up having a lot of fun.", ja: "パーティー行きたくなかったけど、結局めっちゃ楽しんだ。" },
  ]},
  { number: 97, category: "expr2", pattern: "it is what it is", meaning: "仕方がない", note: "What+主語+動詞 で「主語が動詞すること」という意味で、ゆえに what it is は「その状態であること＝ありのままの姿」を意味します。よって、この表現は「それはありのままの姿なんだ＝仕方ない、そういうものさ」という意味で使われます。", examples: [
    { en: "There's nothing I can do about it, so it is what it is.", ja: "どうすることもできないから、仕方ない。" },
  ]},
  { number: 98, category: "expr2", pattern: "in general", meaning: "全体的に、一般に", note: "overall や by and large と同じ意味で使われる表現で、話の内容を「ざっくりと」捉えたい時に使われる表現です。", examples: [
    { en: "What did you think about this in general?", ja: "全体的にどう思った？" },
  ]},
  { number: 99, category: "expr2", pattern: "at all", meaning: "ちょっとでも", note: "否定文で「全く〜ない」という意味で使われる表現としてよく習いますが、if 節や疑問文でもよく使われ、その場合は「ちょっとでも」という意味で使われます。", examples: [
    { en: "Did you like it at all?", ja: "ちょっとでも良いと思った？" },
    { en: "If you like this video at all, please hit the like button.", ja: "この動画がちょっとでも気に入ってくれたら高評価お願いします。" },
  ]},
  { number: 100, category: "expr2", pattern: "if that's the case", meaning: "もしそうなら", note: "直訳すると「もしそれが実際の場合・状況ならば」となり、それが発展して「それが本当なら」という意味で使われるようになった表現です。", examples: [
    { en: "Did he prepare all the slides? If that's the case, you don't have to do anything.", ja: "彼がスライド全部作ったの？もしそうなら、君は何もしなくて良いよ。" },
    { en: "Did he prepare all the slides? If that's the case, I don't have to do anything, right?", ja: "彼がスライド全部作ったの？もしそうなら、私は何もしなくて良いんだよね。" },
  ]},

  // ===== ATSUがよく使う表現20選 Part 3 =====
  { number: 101, category: "expr3", pattern: "I'd say", meaning: "私の意見では", note: "自分の意見や感想を述べる際に使えます。控えめに言いたいときにも便利です。", examples: [
    { en: "I'd say the price is pretty fair.", ja: "価格はかなり妥当だと思います。" },
    { en: "I'd say it was a great experience, but I don't think everyone would feel the same way.", ja: "素晴らしい経験だったと私は思いますが、みんなが同感するとは思いません。" },
  ]},
  { number: 102, category: "expr3", pattern: "in the process of", meaning: "〜の過程にある", note: "何かの進行中であることを示すときに使います。目標に向かっている途中であることを強調する表現です。", examples: [
    { en: "We're in the process of trying to figure out what caused the issue.", ja: "私たちは問題の原因を解明しようとしています。" },
    { en: "I'm in the process of learning English.", ja: "英語学習の過程にあります。" },
  ]},
  { number: 103, category: "expr3", pattern: "it's more like", meaning: "むしろ〜のようだ", note: "正確な説明を避けて、より適切な例や比喩を使うときに使います。相手に分かりやすく伝えるための表現です。", examples: [
    { en: "I wouldn't say it's work. It's more like my hobby, if that makes sense.", ja: "それは仕事というよりは、趣味のようなものです。" },
    { en: "It's not exactly a party; it's more like a social gathering.", ja: "正確にはパーティーというわけではなく、むしろ社交的な集まりです。" },
  ]},
  { number: 104, category: "expr3", pattern: "from that point of view", meaning: "その観点から見ると", note: "特定の視点や観点から物事を考えるときに使います。別の見方を提供したいときに役立ちます。", examples: [
    { en: "I think it makes sense from that point of view.", ja: "その観点からは理解できるかもしれません。" },
    { en: "I don't think I made the right decision from that point of view.", ja: "その観点から見ると、正しい判断ではなかったと思います。" },
  ]},
  { number: 105, category: "expr3", pattern: "if that works for you", meaning: "それが都合がいいなら", note: "相手の都合や意向を確認する際に使います。柔軟で配慮のあるコミュニケーションを促します。", examples: [
    { en: "Can we do a zoom call on Wednesday, if that works for you?", ja: "ご都合が良ければ、水曜日にZoomで会議できますか？" },
    { en: "I can send it tomorrow, if that works for you.", ja: "もしそれで良ければ、明日送ります。" },
  ]},
  { number: 106, category: "expr3", pattern: "just out of curiosity", meaning: "単なる好奇心から", note: "単なる好奇心から質問するときに使います。相手に負担をかけないような質問の仕方です。", examples: [
    { en: "Just out of curiosity, why did you come to Japan?", ja: "単なる好奇心からですが、なぜ日本に来たんですか？" },
    { en: "Just asking out of curiosity, so if you don't want to answer, that's totally fine.", ja: "単なる好奇心から聞いていますので、答えたくなければそれで全く問題ありません。" },
  ]},
  { number: 107, category: "expr3", pattern: "off-topic, but", meaning: "話は変わりますが", note: "話題を変えるときに使います。会話の流れを保ちながら、別の重要な点に移ることができます。", examples: [
    { en: "Bit off-topic, but I just finished editing the video.", ja: "少し話は変わりますが、動画編集を終えました。" },
    { en: "Off topic, but did you end up going to the cafe? How was it?", ja: "話は変わりますが、結局そのカフェに行きましたか？どうでしたか？" },
  ]},
  { number: 108, category: "expr3", pattern: "out of the blue", meaning: "突然に", note: "予期せぬことが起こったり話題が出たりしたときに使います。驚きを表現するのに適しています。", examples: [
    { en: "Everyone started talking about it out of the blue.", ja: "皆、突然その話を始めました。" },
    { en: "Out of the blue, she brought up the topic and I was like, \"What the heck?\"", ja: "突然、彼女がその話題を持ち出して、私は「何だって？」と思いました。" },
  ]},
  { number: 109, category: "expr3", pattern: "off the top of my head", meaning: "思いつくままに", note: "即座に思いつくことを述べるときに使います。詳細な情報がない場合に便利な表現です。", examples: [
    { en: "Off the top of my head, I think it's wrong.", ja: "思いつくままに言うと、それは間違っていると思います。" },
    { en: "I can't remember all the details off the top of my head, but I'll send it later.", ja: "詳細はすぐには思い出せませんが、後で送ります。" },
  ]},
  { number: 110, category: "expr3", pattern: "but at the same time", meaning: "しかし同時に", note: "相反する二つの事柄を同時に述べるときに使います。バランスの取れた視点を提供するのに役立ちます。", examples: [
    { en: "He's intelligent, but at the same time, he's a little bit stupid in a way.", ja: "彼は賢いですが、同時に少し愚かな面もあります。" },
    { en: "I wanna have fun, but at the same time, I want some learning.", ja: "楽しみたいですが、同時に学びも得たいです。" },
  ]},
  { number: 111, category: "expr3", pattern: "the flip side of it is...", meaning: "それの裏側は… / その反面", note: "物事の別の側面や反対の面を述べる際に使います。バランスの取れた意見を述べるのに役立つ表現です。", examples: [
    { en: "It makes you look good, but the flip side of it is you're making so much effort.", ja: "それはあなたを良く見せますが、反面、多くの努力を要します。" },
    { en: "This approach is efficient, but the flip side of it is it costs more.", ja: "この方法は効率的ですが、その反面、費用がかかります。" },
  ]},
  { number: 112, category: "expr3", pattern: "from the perspective of", meaning: "〜の観点から", note: "特定の視点や観点から物事を考えるときに使います。異なる見方や立場を示すのに便利です。", examples: [
    { en: "Making complaints usually doesn't give you anything from the perspective of solving the problem.", ja: "不満を言うことは、問題を解決する観点からは何ももたらしません。" },
    { en: "I think being able to speak two languages is really helpful from the perspective of having options in my life.", ja: "人生において選択肢を持つ観点から、二ヶ国語を話せることはとても役立つと思います。" },
  ]},
  { number: 113, category: "expr3", pattern: "two sides of the same coin", meaning: "表裏一体", note: "対立するが密接に関連している二つの側面を示すときに使います。リスクとチャンスのような関係を説明するのに役立ちます。", examples: [
    { en: "I'd say risk and opportunity are two sides of the same coin.", ja: "リスクとチャンスは表裏一体だと言えます。" },
    { en: "Pain and gain are two sides of the same coin.", ja: "苦痛と得るものは表裏一体です。" },
  ]},
  { number: 114, category: "expr3", pattern: "like I (you) said,", meaning: "私（あなた）が言ったように", note: "自分または相手が以前に言ったことを繰り返すときに使います。会話の連続性を保つのに便利です。", examples: [
    { en: "Like I said, it's completely up to you.", ja: "私が言ったように、それは完全にあなた次第です。" },
    { en: "Like you said, I think it's important to have a balance between work and life.", ja: "あなたが言ったように、仕事と私生活のバランスを取ることは大事だと思います。" },
  ]},
  { number: 115, category: "expr3", pattern: "I'm more of a", meaning: "私はむしろ〜タイプの人間です", note: "自分の性格や嗜好を説明するときに使います。自分のスタイルや好みを強調する表現です。", examples: [
    { en: "I'm more of a minimalist so I don't like to own a lot of things.", ja: "私はミニマリストタイプなので、たくさんのものを持つのが好きではありません。" },
    { en: "I'm more of a just go with the flow kind of person so I don't really care.", ja: "私は流れに任せるタイプなので、あまり気にしません。" },
  ]},
  { number: 116, category: "expr3", pattern: "it's all about", meaning: "すべては〜にかかっている", note: "物事の核心や最も重要な要素を強調するときに使います。何が本当に重要なのかを示すのに役立ちます。", examples: [
    { en: "It's all about what you really wanna achieve.", ja: "すべてはあなたが本当に達成したいことにかかっています。" },
    { en: "It's all about how you study.", ja: "すべてはあなたがどのように勉強するかにかかっています。" },
  ]},
  { number: 117, category: "expr3", pattern: "given that", meaning: "〜を考慮すると", note: "何かを考慮するときに使います。特定の状況や条件を前提にして説明をするのに便利です。", examples: [
    { en: "I'd say I'm more of a minimalist, given that I only have a couple of things in my room.", ja: "部屋に持ち物が少ないことを考慮すると、私はミニマリストだと言えます。" },
    { en: "It kind of makes sense that many people are trying to leave this company, given that it's got so many problems.", ja: "この会社に多くの問題があることを考慮すると、多くの人がこの会社を辞めようとしているのは理解できます。" },
  ]},
  { number: 118, category: "expr3", pattern: "I might be wrong, but", meaning: "私が間違っているかもしれませんが", note: "自分の意見や指摘が正しいかどうか自信がないときに使います。謙虚さを示しつつ意見を述べるのに適しています。", examples: [
    { en: "I might be wrong, but isn't this calc incorrect?", ja: "間違っているかもしれませんが、この計算は間違ってませんか？" },
    { en: "I might be wrong, but I think he's very intelligent.", ja: "間違っているかもしれませんが、彼はとても賢いと思います。" },
  ]},
  { number: 119, category: "expr3", pattern: "in terms of", meaning: "〜の点では", note: "特定の観点や基準から物事を説明するときに使います。複数の側面を比較するのに役立ちます。", examples: [
    { en: "I think my English is okay in terms of vocabulary, but my pronunciation needs more improvement.", ja: "語彙の点では私の英語は大丈夫だと思いますが、発音はもっと改善が必要です。" },
    { en: "It's not great in terms of health, but it tastes so good.", ja: "健康の点では良くないですが、とても美味しいです。" },
  ]},
  { number: 120, category: "expr3", pattern: "this is something that", meaning: "これは〜というものだ", note: "特定の事柄を強調するときに使います。自分にとって特別な意味を持つことや、重要な目標を示すのに便利です。", examples: [
    { en: "This is something that I've always wanted to do.", ja: "これは私がいつもやりたかったことです。" },
    { en: "This is something that only I can do.", ja: "これは私にしかできないことです。" },
  ]},
];


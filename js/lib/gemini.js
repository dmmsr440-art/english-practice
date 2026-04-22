// Gemini API 連携
// - generateTranslation(ja): 日本語 → 英訳
// - generatePronunciationPoints(en, ja?): 英文 → 発音ポイント（ユーザー独自フォーマット）
// - APIキーはFirestoreのprofileに保存（users/{uid}/meta/profile.geminiApiKey）

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// APIキー（メモリキャッシュ）
let cachedApiKey = null;
export function setGeminiApiKey(key) {
    cachedApiKey = key || null;
}
export function hasGeminiApiKey() {
    return !!cachedApiKey;
}

// ---- 翻訳プロンプト ----
const TRANSLATION_SYSTEM = `あなたは日本人ビジネスパーソン向けの英訳アシスタントです。
以下のルールに従って、日本語を自然で会議・ビジネス会話で使える英語に訳してください。

ルール:
- ネイティブが実際に使う自然な英語表現にする（直訳を避ける）
- ビジネス・会議で違和感のない丁寧さ
- 文脈に応じて言い換え候補を ( ) 内に併記してよい（例: "consecutive(straight)"）
- 出力は英文のみ。前置き・説明・改行は一切不要。
- ダブルクォート等で囲まない。`;

// ---- 発音ポイントプロンプト（few-shot）----
const PRONUNCIATION_SYSTEM = `あなたは日本人学習者向けの英語発音コーチです。
与えられた英文から、日本人がつまずく「音の連結・脱落・変化」ポイントを抽出し、
指定のHTMLフォーマットで出力してください。

使える音声ルール（必ずこの名前を使う）:
- <b>TDL法則</b>: T/D/Lが母音に挟まれるとラ行化
- <b>子から母</b>: 子音末尾+次の語の母音始まりでリンキング
- <b>タケコプター</b>: 末尾のG/K/T/Dが弱まる・消える
- <b>Lの洗脳</b>: 末尾のLが「ゥ」に近くなる
- <b>双子の法則</b>: 同じ・近い子音が続くと前の子音が消える
- <b>NがT飲み込む</b>: N+TでTが消える（例: "don't" → 「ドウン」）
- <b>H隠れんぼ</b>: 代名詞・助動詞のHが消える（he/his/her/has/have）
- 複合ルール（組合せ）も使える（例: "TDL+子から母"、"H隠れんぼ+TDL"）

出力フォーマット（厳守）:
各行は次の形式のbullet。行の区切りは <br> タグのみ（改行文字は使わない）:
• <b>ルール名</b>: "該当英語フレーズ" → 変化の説明 → 「カタカナ表現<u>強調箇所</u>」<br>

ルール:
- 2〜5個の箇条書きに絞る（多すぎない、重要ポイントを厳選）
- <b>と<u>タグのみ使用（他のHTMLは使わない）
- <u>は変化が起きた箇所のカタカナを必ず囲む
- 最後の行の末尾には <br> を付けない
- 出力はHTMLのみ。前置き・説明・コードブロックは一切不要。

参考例:
入力: "I attended the meeting for three consecutive years."
出力: • <b>TDL法則</b>: "attended" → Tが母音に挟まれラ行化 → 「アテン<u>レ</u>ッ」<br>• <b>TDL法則</b>: "meeting" → Tが母音挟まれ+G消え → 「ミー<u>リ</u>ン」<br>• <b>子から母</b>: "for a" → R+A → 「<u>フォーラ</u>」

入力: "What time works for you?"
出力: • <b>双子の法則</b>: "What time" → T+T連続で前のTが消える → 「<u>ワタイム</u>」<br>• <b>子から母+Y</b>: "for you" → R+Y連結 → 「<u>フォーユ</u>」`;

async function callGemini(systemInstruction, userText, { temperature = 0.4 } = {}) {
    if (!cachedApiKey) {
        throw new Error("Gemini APIキーが未設定です。設定画面から登録してください。");
    }
    const url = `${ENDPOINT}?key=${encodeURIComponent(cachedApiKey)}`;
    const body = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: {
            temperature,
            responseMimeType: "text/plain"
        }
    };
    const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        throw new Error(`Gemini API エラー (${resp.status}): ${errText.slice(0, 200)}`);
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Geminiから空のレスポンスが返りました");
    return text.trim();
}

export async function generateTranslation(ja) {
    if (!ja?.trim()) throw new Error("日本語が空です");
    return callGemini(TRANSLATION_SYSTEM, ja.trim(), { temperature: 0.4 });
}

export async function generatePronunciationPoints(en, ja = "") {
    if (!en?.trim()) throw new Error("英文が空です");
    const prompt = ja
        ? `英文: ${en.trim()}\n（参考：日本語訳は「${ja.trim()}」）`
        : `英文: ${en.trim()}`;
    return callGemini(PRONUNCIATION_SYSTEM, prompt, { temperature: 0.3 });
}

// APIキーの簡易疎通チェック（任意）
export async function testGeminiKey(key) {
    const prev = cachedApiKey;
    cachedApiKey = key;
    try {
        await callGemini("出力: OK のみ", "test", { temperature: 0 });
        return true;
    } finally {
        cachedApiKey = prev;
    }
}

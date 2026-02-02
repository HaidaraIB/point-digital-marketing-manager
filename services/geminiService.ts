
import { GoogleGenAI } from "@google/genai";
import { AppData, VoucherType } from "../types.ts";

export const analyzeFinances = async (data: AppData) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fixed: Using VoucherType enum instead of incorrect string literal 'EXPENDITURE'
    const totalReceipts = data.vouchers
      .filter(v => v.type === VoucherType.RECEIPT)
      .reduce((sum, v) => sum + v.amount, 0);
    const totalExpenses = data.vouchers
      .filter(v => v.type === VoucherType.PAYMENT)
      .reduce((sum, v) => sum + v.amount, 0);
    const acceptedQuotesTotal = data.quotations
      .filter(q => q.status === 'ACCEPTED')
      .reduce((sum, q) => sum + q.total, 0);
    const pendingQuotes = data.quotations.filter(q => q.status === 'PENDING').length;

    const prompt = `
      أنت خبير مالي واستراتيجي لوكالة تسويق رقمي في العراق تسمى "${data.settings.name}".
      البيانات المالية الحالية للوكالة:
      - إجمالي المقبوضات النقدية: ${totalReceipts.toLocaleString()} دينار عراقي.
      - إجمالي المصروفات: ${totalExpenses.toLocaleString()} دينار عراقي.
      - صافي الربح التشغيلي: ${(totalReceipts - totalExpenses).toLocaleString()} دينار عراقي.
      - قيمة العقود المبرمة (المقبولة): ${acceptedQuotesTotal.toLocaleString()} دينار عراقي.
      - عروض أسعار قيد التفاوض: ${pendingQuotes}.

      المطلوب منك كذكاء اصطناعي:
      1. تقديم قراءة سريعة واحترافية للوضع المالي الحالي في سطرين.
      2. تقديم نصيحة استراتيجية واحدة مبتكرة (خارج الصندوق) مخصصة لجذب العملاء في العراق (مثلاً في بغداد أو أربيل) لزيادة نسبة قبول عروض الأسعار المعلقة.
      
      اجعل الأسلوب ملهماً، مهنياً، ومختصراً جداً.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "نعتذر، واجه نظام الذكاء الاصطناعي صعوبة في معالجة البيانات حالياً. يرجى التأكد من إدخال بعض البيانات المالية أولاً.";
  }
};

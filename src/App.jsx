import { useState } from "react";

const apiUrl = import.meta.env.VITE_LEAD_API_URL;
const projectId = Number(import.meta.env.VITE_PROJECT_ID);

const initialForm = {
  rooms: "",
  fullName: "",
  phone: "",
  extraPhone: "",
};

const roomOptions = ["1", "2", "3"];

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  const parts = [];

  if (digits.length > 0) {
    parts.push(digits.slice(0, 2));
  }
  if (digits.length > 2) {
    parts.push(digits.slice(2, 5));
  }
  if (digits.length > 5) {
    parts.push(digits.slice(5, 7));
  }
  if (digits.length > 7) {
    parts.push(digits.slice(7, 9));
  }

  return parts.join(" ");
}

function validate(form) {
  const nextErrors = {};
  const phonePattern = /^\d{9}$/;

  if (!form.rooms) {
    nextErrors.rooms = "Variant tanlang";
  }

  if (!form.fullName.trim()) {
    nextErrors.fullName = "Ism kiriting";
  }

  if (!form.phone.trim()) {
    nextErrors.phone = "Telefon raqam kiriting";
  } else if (!phonePattern.test(form.phone.trim())) {
    nextErrors.phone = "Raqamni to‘liq kiriting: 90 123 45 67";
  }

  if (form.extraPhone.trim() && !phonePattern.test(form.extraPhone.trim())) {
    nextErrors.extraPhone = "Raqamni to‘liq kiriting: 90 123 45 67";
  }

  return nextErrors;
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue =
      name === "phone" || name === "extraPhone"
        ? value.replace(/\D/g, "")
        : value;

    const nextForm = { ...form, [name]: nextValue };
    setForm(nextForm);
    setErrors((current) => ({ ...current, [name]: validate(nextForm)[name] }));
    setSubmitted(false);
    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false);
      return;
    }

    if (!apiUrl || !projectId) {
      setSubmitted(false);
      setSubmitError("Tizim sozlanmagan. .env faylni tekshiring.");
      return;
    }

    const payload = {
      projectId,
      tag: [form.rooms],
      firstName: form.fullName.trim(),
      phone: `+998${form.phone}`,
      extraPhone: form.extraPhone ? `+998${form.extraPhone}` : "",
    };

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("So'rov yuborilmadi");
      }

      setSubmitted(true);
      setForm(initialForm);
    } catch {
      setSubmitted(false);
      setSubmitError("Yuborishda xatolik bo'ldi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "mt-3 w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-600";
  const phoneInputClassName =
    "w-full border-0 bg-transparent px-0 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <section className="rounded-xl border-t-8 border-violet-600 bg-white px-6 py-7 shadow-sm">
          <h1 className="text-3xl font-normal text-slate-900">
            Uy uchun ariza
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Quyidagi ma'lumotlarni to'ldiring.
          </p>
          {/* <p className="mt-4 text-xs text-red-600">* Majburiy savol</p> */}
        </section>

        {submitted && (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 shadow-sm">
            <p className="text-sm font-medium text-emerald-800">
              Ma'lumot muvaffaqiyatli yuborildi.
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Tez orada siz bilan bog'lanamiz.
            </p>
          </section>
        )}

        {submitError && (
          <section className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 shadow-sm">
            <p className="text-sm font-medium text-red-700">{submitError}</p>
          </section>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <section className="rounded-xl bg-white px-6 py-6 shadow-sm">
            <label className="block text-lg text-slate-900">
              1. Necha xonalik uy olmoqchisiz?{" "}
              <span className="text-red-600">*</span>
            </label>
            <div className="mt-5 space-y-4">
              {roomOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 text-base text-slate-800"
                >
                  <input
                    type="radio"
                    name="rooms"
                    value={option}
                    checked={form.rooms === option}
                    onChange={handleChange}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <FieldError message={errors.rooms} />
          </section>

          <section className="rounded-xl bg-white px-6 py-6 shadow-sm">
            <label htmlFor="fullName" className="block text-lg text-slate-900">
              2. Ismingiz? <span className="text-red-600">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Javobingiz"
              className={inputClassName}
            />
            <FieldError message={errors.fullName} />
          </section>

          <section className="rounded-xl bg-white px-6 py-6 shadow-sm">
            <label htmlFor="phone" className="block text-lg text-slate-900">
              3. Tel raqam? <span className="text-red-600">*</span>
            </label>
            <div className="mt-3 flex items-center gap-3 border-b border-slate-300 focus-within:border-violet-600">
              <span className="shrink-0 text-base text-slate-500">+998</span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={formatPhone(form.phone)}
                onChange={handleChange}
                placeholder="90 123 45 67"
                maxLength={12}
                className={phoneInputClassName}
              />
            </div>
            {/* <p className="mt-2 text-sm text-slate-500">
              Ko‘rinishi: +998 90 123 45 67
            </p> */}
            <FieldError message={errors.phone} />
          </section>

          <section className="rounded-xl bg-white px-6 py-6 shadow-sm">
            <label
              htmlFor="extraPhone"
              className="block text-lg text-slate-900"
            >
              4. Qo'shimcha raqam?
            </label>
            <div className="mt-3 flex items-center gap-3 border-b border-slate-300 focus-within:border-violet-600">
              <span className="shrink-0 text-base text-slate-500">+998</span>
              <input
                id="extraPhone"
                name="extraPhone"
                type="tel"
                inputMode="numeric"
                value={formatPhone(form.extraPhone)}
                onChange={handleChange}
                placeholder="90 123 45 67"
                maxLength={12}
                className={phoneInputClassName}
              />
            </div>
            {/* <p className="mt-2 text-sm text-slate-500">
              Ixtiyoriy maydon. Zarur bo'lsa kiriting.
            </p> */}
            <FieldError message={errors.extraPhone} />
          </section>

          <div className="flex items-center justify-between px-1 py-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setErrors({});
                setSubmitted(false);
                setSubmitError("");
              }}
              className="text-sm font-medium text-violet-700 transition hover:text-violet-800"
            >
              Formani tozalash
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

export default App;

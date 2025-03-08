// api.ts
export const runCode = async (source_code: string, languageId: number, stdin: string|null) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code,
          language_id: languageId,
          stdin: stdin,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Execution Error:", error);
      return { error: "Execution failed" };
    }
  };
  
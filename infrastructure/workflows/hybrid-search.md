---
description: How to perform a Hybrid Semantic Search when local AI is missing.
---

# Workflow: Hybrid Semantic Search

1.  **CLI**: Mendeteksi query pencarian memori.
2.  **CLI**: Mengecek ketersediaan `onnxruntime` lokal.
3.  **Fallback (No AI)**:
    - CLI memanggil **Jaccard Similarity** engine.
    - CLI memberikan tag `[LITE:EXPAND_QUERY]` ke terminal output.
4.  **AI Assistant (IDE)**: 
    - Mendeteksi tag ekspansi.
    - Menghasilkan daftar sinonim teknis yang relevan.
5.  **CLI**: Mengupdate pencarian dengan sinonim baru untuk mendapatkan hasil yang lebih akurat.
6.  **CLI**: Menampilkan hasil memori ke user.

from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """
    Generates sentence embeddings for complaint text.
    """

    model = SentenceTransformer("all-MiniLM-L6-v2")

    @classmethod
    def encode(cls, text: str):
        return cls.model.encode(
            text,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
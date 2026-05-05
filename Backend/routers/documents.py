"""Module document upload + RAG chunking."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import DocumentChunk, Module, ModuleDocument, User
from ..utils.auth import get_current_user
from ..utils.documents import chunk_text, extract_text_from_file
from ..utils.serializers import doc_to_dict

router = APIRouter(prefix="/api/modules", tags=["documents"])


@router.post("/{module_id}/documents")
async def upload_document(
    module_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    if module.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    file_bytes = await file.read()
    text = extract_text_from_file(file_bytes, file.filename or "unknown", file.content_type or "text/plain")

    doc = ModuleDocument(
        id=str(uuid.uuid4()),
        module_id=module_id,
        file_name=file.filename or "unknown",
        file_size=len(file_bytes),
        mime_type=file.content_type or "text/plain",
        file_content=text,
        is_processed=False,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    chunks = chunk_text(text)
    for idx, content in enumerate(chunks):
        db.add(
            DocumentChunk(
                id=str(uuid.uuid4()),
                document_id=doc.id,
                module_id=module_id,
                chunk_index=idx,
                content=content,
                token_count=len(content.split()),
            )
        )

    doc.is_processed = True
    db.commit()

    return {
        "id": doc.id,
        "fileName": doc.file_name,
        "fileSize": doc.file_size,
        "mimeType": doc.mime_type,
        "chunksCreated": len(chunks),
        "isProcessed": True,
    }


@router.get("/{module_id}/documents")
def list_module_documents(module_id: str, db: Session = Depends(get_db)):
    docs = db.query(ModuleDocument).filter(ModuleDocument.module_id == module_id).all()
    return [doc_to_dict(d) for d in docs]


@router.delete("/{module_id}/documents/{document_id}")
def delete_document(
    module_id: str,
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module or module.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.query(ModuleDocument).filter(
        ModuleDocument.id == document_id,
        ModuleDocument.module_id == module_id,
    ).delete()
    db.commit()
    return {"deleted": True}

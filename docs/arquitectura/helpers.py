"""Helpers de contenido compartidos por el generador de arquitectura."""
from __future__ import annotations
import html as _html
import textwrap


def h(text: str) -> str:
    return _html.escape(text, quote=False)


def mermaid(code: str, caption: str = "Click para ampliar") -> str:
    code = textwrap.dedent(code).strip()
    return (
        '<figure class="diagram">\n'
        f'  <pre class="mermaid">\n{h(code)}\n</pre>\n'
        f'  <figcaption><span class="zoom-hint">🔍 {h(caption)}</span></figcaption>\n'
        "</figure>"
    )


def table(headers: list[str], rows: list[list[str]]) -> str:
    head = "".join(f"<th>{c}</th>" for c in headers)
    body = "".join(
        "<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows
    )
    return f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>"


def callout(kind: str, body: str) -> str:
    icons = {"info": "ℹ️", "warn": "⚠️", "ok": "✅", "tip": "💡"}
    return (
        f'<div class="callout {kind}"><span class="ic">{icons.get(kind, "ℹ️")}</span>'
        f"<div>{body}</div></div>"
    )


def code(text: str) -> str:
    return f'<pre class="code">{h(textwrap.dedent(text).strip())}</pre>'


def section(anchor: str, title: str, *blocks: str) -> str:
    inner = "\n".join(blocks)
    return f'<section id="{anchor}"><h2>{h(title)}</h2>\n{inner}\n</section>'

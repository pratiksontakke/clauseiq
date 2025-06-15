-- Vector similarity search function
create or replace function match_chunks(
  query_embedding vector(1536),
  match_count int,
  contract_version_id uuid
)
returns table (
  id uuid,
  contract_id uuid,
  version_id uuid,
  chunk_id text,
  text text,
  page_num int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    e.id,
    e.contract_id,
    e.version_id,
    e.chunk_id,
    e.text,
    e.page_num,
    1 - (e.embedding <=> query_embedding) as similarity
  from embeddings e
  where e.version_id = contract_version_id
  order by e.embedding <=> query_embedding
  limit match_count;
end;
$$; 
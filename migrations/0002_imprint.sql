create table if not exists collections (
  id          text primary key,
  user_id     text not null,
  kind        text not null,
  name        text not null,
  bible       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists collections_user_id_idx on collections (user_id);

create table if not exists frames (
  id             text primary key,
  collection_id  text not null references collections(id) on delete cascade,
  user_id        text not null,
  role           text not null,
  prompt_id      text,
  prompt_label   text not null default '',
  prompt_text    text not null default '',
  master_prompt  text not null default '',
  image_data     text not null,
  aspect         text not null default '2:3',
  resolution     text not null default '1k',
  created_at     timestamptz not null default now()
);
create index if not exists frames_collection_id_idx on frames (collection_id);
create index if not exists frames_user_id_idx on frames (user_id);

create table if not exists combine_jobs (
  id              text primary key,
  user_id         text not null,
  title           text not null,
  prompt_text     text not null,
  collection_ids  text not null,
  image_data      text not null,
  created_at      timestamptz not null default now()
);
create index if not exists combine_jobs_user_id_idx on combine_jobs (user_id);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price NUMERIC NOT NULL,
  product_type TEXT DEFAULT 'abaya' CHECK (product_type IN ('abaya', 'regular'))
);

CREATE TABLE pricings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  price NUMERIC NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  product_type TEXT DEFAULT 'abaya' CHECK (product_type IN ('abaya', 'regular'))
);

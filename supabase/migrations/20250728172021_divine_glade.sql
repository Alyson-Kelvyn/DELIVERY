/*
  # Insert sample products

  1. Sample Data
    - Insert initial products for the churrascaria menu
    - All products set as available by default
*/

INSERT INTO public.products (name, description, price, image_url, available) VALUES
  (
    'Marmita de Picanha',
    'Deliciosa picanha grelhada com arroz, feijão, farofa e vinagrete',
    18.90,
    'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=500',
    true
  ),
  (
    'Marmita de Maminha',
    'Suculenta maminha na brasa com acompanhamentos tradicionais',
    16.90,
    'https://images.pexels.com/photos/2491273/pexels-photo-2491273.jpeg?auto=compress&cs=tinysrgb&w=500',
    true
  ),
  (
    'Marmita de Fraldinha',
    'Fraldinha temperada na medida certa com todos os acompanhamentos',
    15.90,
    'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500',
    true
  ),
  (
    'Marmita de Costela',
    'Costela bovina assada lentamente, derretendo na boca',
    19.90,
    'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=500',
    true
  ),
  (
    'Marmita de Linguiça',
    'Linguiça artesanal grelhada com temperos especiais',
    13.90,
    'https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=500',
    true
  ),
  (
    'Marmita de Alcatra',
    'Alcatra macia e suculenta com o sabor inconfundível do churrasco',
    17.90,
    'https://images.pexels.com/photos/1409050/pexels-photo-1409050.jpeg?auto=compress&cs=tinysrgb&w=500',
    true
  )
ON CONFLICT (id) DO NOTHING;
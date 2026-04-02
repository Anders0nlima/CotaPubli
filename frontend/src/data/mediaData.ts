export interface MediaListing {
  id: string;
  title: string;
  type: string;
  location: string;
  price: string;
  priceNumber: number;
  reach: string;
  reachNumber: number;
  image: string;
  seller: string;
  rating: number;
  verified: boolean;
  description?: string;
}

export const mediaListings: MediaListing[] = [
  {
    id: "1",
    title: "Painel LED - Avenida Paulista",
    type: "Painel LED",
    location: "São Paulo, SP",
    price: "R$ 8.500/mês",
    priceNumber: 8500,
    reach: "120k pessoas/dia",
    reachNumber: 120000,
    image: "https://images.unsplash.com/photo-1652765436113-3f856919ff53?w=600&q=80",
    seller: "MídiaOut SP",
    rating: 4.8,
    verified: true,
    description: "Painel LED de alta resolução na Avenida Paulista, com visibilidade 24h. Ideal para campanhas de alto impacto."
  },
  {
    id: "2",
    title: "Outdoor - Marginal Tietê",
    type: "Outdoor",
    location: "São Paulo, SP",
    price: "R$ 4.200/mês",
    priceNumber: 4200,
    reach: "85k pessoas/dia",
    reachNumber: 85000,
    image: "https://images.unsplash.com/photo-1763671727638-5bc55bb9c980?w=600&q=80",
    seller: "Visual Propaganda",
    rating: 4.5,
    verified: true,
    description: "Outdoor em ponto estratégico na Marginal Tietê, com alta visibilidade para motoristas."
  },
  {
    id: "3",
    title: "Spot Rádio Band FM - 30s",
    type: "Rádio",
    location: "Nacional",
    price: "R$ 1.800/inserção",
    priceNumber: 1800,
    reach: "2M ouvintes",
    reachNumber: 2000000,
    image: "https://images.unsplash.com/photo-1767474833531-c1be2788064a?w=600&q=80",
    seller: "Band FM",
    rating: 4.9,
    verified: true,
    description: "Spot de 30 segundos na Band FM, com cobertura nacional e público diversificado."
  },
  {
    id: "4",
    title: "Publipost Instagram - @fitnesslife",
    type: "Influenciador Digital",
    location: "Brasil",
    price: "R$ 3.500/post",
    priceNumber: 3500,
    reach: "450k seguidores",
    reachNumber: 450000,
    image: "https://images.unsplash.com/photo-1762535120786-76238d9eeb0d?w=600&q=80",
    seller: "Fitness Life",
    rating: 4.7,
    verified: true,
    description: "Publipost no feed do Instagram com stories inclusos. Público: saúde e bem-estar."
  },
  {
    id: "5",
    title: "Parada de Ônibus - Centro RJ",
    type: "Parada de Ônibus",
    location: "Rio de Janeiro, RJ",
    price: "R$ 2.100/mês",
    priceNumber: 2100,
    reach: "35k pessoas/dia",
    reachNumber: 35000,
    image: "https://images.unsplash.com/photo-1579977789113-266e6c88c0ea?w=600&q=80",
    seller: "JCDecaux RJ",
    rating: 4.3,
    verified: false,
    description: "Abrigo de ônibus em ponto de grande circulação no centro do Rio de Janeiro."
  },
  {
    id: "6",
    title: "TV Regional - Intervalo Jornal",
    type: "TV",
    location: "Minas Gerais",
    price: "R$ 12.000/mês",
    priceNumber: 12000,
    reach: "500k telespectadores",
    reachNumber: 500000,
    image: "https://images.unsplash.com/photo-1671575584088-03eb2811c30f?w=600&q=80",
    seller: "TV Alterosa",
    rating: 4.6,
    verified: true,
    description: "Inserção de 30s no intervalo do jornal local. Cobertura em todo o estado de Minas Gerais."
  },
  {
    id: "7",
    title: "Painel LED Digital - Shopping Center Norte",
    type: "Painel LED",
    location: "São Paulo, SP",
    price: "R$ 5.800/mês",
    priceNumber: 5800,
    reach: "60k pessoas/dia",
    reachNumber: 60000,
    image: "https://images.unsplash.com/photo-1652765436113-3f856919ff53?w=600&q=80",
    seller: "Digital Media SP",
    rating: 4.4,
    verified: true,
    description: "Tela LED interna no Shopping Center Norte, próximo à praça de alimentação."
  },
  {
    id: "8",
    title: "Outdoor Iluminado - BR-101",
    type: "Outdoor",
    location: "Santa Catarina",
    price: "R$ 3.200/mês",
    priceNumber: 3200,
    reach: "45k veículos/dia",
    reachNumber: 45000,
    image: "https://images.unsplash.com/photo-1763671727638-5bc55bb9c980?w=600&q=80",
    seller: "Sul Outdoor",
    rating: 4.2,
    verified: false,
    description: "Outdoor iluminado na BR-101 em trecho de Florianópolis. Visibilidade noturna garantida."
  },
  {
    id: "9",
    title: "Campanha YouTube - Canal Tech Review",
    type: "Influenciador Digital",
    location: "Brasil",
    price: "R$ 6.500/vídeo",
    priceNumber: 6500,
    reach: "800k inscritos",
    reachNumber: 800000,
    image: "https://images.unsplash.com/photo-1762535120786-76238d9eeb0d?w=600&q=80",
    seller: "Tech Review BR",
    rating: 4.9,
    verified: true,
    description: "Integração de marca em vídeo dedicado no canal. Público: tecnologia e inovação."
  },
];

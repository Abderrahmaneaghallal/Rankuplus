// prisma/seed-blog.js
// Seeds the DB with 50 real articles from rankuplus.com WordPress blog
// Run with: node prisma/seed-blog.js

require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Image map: media_id → source_url ────────────────────────────────────────
const imageMap = {
  6473: '/wp-content/uploads/2026/06/heropng.png',
  6445: '/wp-content/uploads/2026/05/heropng-1.png',
  6436: '/wp-content/uploads/2026/05/heropng.png',
  6431: '/wp-content/uploads/2026/05/Le-Guide-Complet-du-Affiliate-Marketing-Lancer-un-Business-Rentable-en-2026.webp',
  6419: '/wp-content/uploads/2026/05/Intelligence-emotionnelle-gerer-les-crises-web-au-Maroc.webp',
  6413: '/wp-content/uploads/2026/05/Pourquoi-le-service-apres-vente-est-votre-meilleur-outil-marketing.webp',
  6408: '/wp-content/uploads/2026/05/E-reputation-et-service-apres-vente-proteger-son-image-de-marque.webp',
  6396: '/wp-content/uploads/2026/05/Le-Guide-du-Marketing-dInfluence-pour-les-marques-en-2026.webp',
  6390: '/wp-content/uploads/2026/05/La-Segmentation-Client-Le-secret-des-campagnes-ultra-ciblees.webp',
  6384: '/wp-content/uploads/2026/05/Landing-Page-Guide-CRO-pour-convertir-plus-au-Maroc.webp',
  6368: '/wp-content/uploads/2026/04/Comment-integrer-loutbound-dans-un-Plan-Marketing-global.webp',
  6363: '/wp-content/uploads/2026/04/Prospection-Commerciale-Cold-Emailing-vs-Calling.webp',
  6358: '/wp-content/uploads/2026/04/Outbound-Marketing-Strategies-pour-Prospecter-Directement.webp',
  6353: '/wp-content/uploads/2026/04/Guide-de-lAutomatisation-du-Marketing-pour-les-PME.webp',
  6325: '/wp-content/uploads/2026/04/SEO-Le-Guide-Ultime-pour-Dominer-les-Resultats-de-Google.webp',
  6348: '/wp-content/uploads/2026/04/Inbound-Marketing-Attirer-Convertir-et-Fideliser-ses-clients.webp',
  6344: '/wp-content/uploads/2026/04/Top-7-Plugins-WordPress-pour-booster-son-SEO.webp',
  6316: '/wp-content/uploads/2026/04/Comment-reussir-son-etude-de-marche-avant-de-lancer-un-projet.webp',
  6330: '/wp-content/uploads/2026/04/Limportance-des-Backlinks-dans-une-strategie-de-netlinking.webp',
  6311: '/wp-content/uploads/2026/04/Guide-Complet-de-la-Strategie-Marketing-Digital-en-2026.webp',
  6306: '/wp-content/uploads/2026/04/Comprendre-limpact-des-reseaux-sociaux-sur-votre-business.webp',
  6301: '/wp-content/uploads/2026/03/Marketing-des-reseaux-sociaux-notre-guide-ultime.webp',
  6293: '/wp-content/uploads/2026/03/ROI-branding-comment-le-mesurer-efficacement.webp',
  6287: '/wp-content/uploads/2026/03/Comment-bien-choisir-une-palette-de-couleurs-dune-marque.webp',
  6275: '/wp-content/uploads/2026/03/Les-7-erreurs-de-branding-a-ne-jamais-commettre.webp',
  6265: '/wp-content/uploads/2026/03/Branding-au-Maroc-Comment-Construire-une-Marque-Forte-en-Ligne.webp',
  6255: '/wp-content/uploads/2026/03/AI-marketing-Guide-complet-pour-les-entreprises-au-Maroc.webp',
  6260: '/wp-content/uploads/2026/03/Limpact-dun-logo-professionnel-sur-la-reussite-de-votre-entreprise.webp',
  6251: '/wp-content/uploads/2026/03/Le-Guide-Ultime-pour-Vendre-en-Ligne-au-Maroc.webp',
  6243: '/wp-content/uploads/2026/03/Email-Marketing-au-Maroc-Le-Levier-Oublie-pour-Booster-vos-Ventes.webp',
  6238: '/wp-content/uploads/2026/03/5-Strategies-Efficaces-pour-la-Generation-de-Leads-B2B-au-Maroc.webp',
  6229: '/wp-content/uploads/2026/03/Comment-creer-une-strategie-de-contenu-qui-attire-des-clients.webp',
  6223: '/wp-content/uploads/2026/03/Photographe-professionnel-Agadir.webp',
  6218: '/wp-content/uploads/2026/03/Les-Types-de-Communication-Lequel-Choisir-pour-votre-Strategie.webp',
  6201: '/wp-content/uploads/2026/03/Social-Media-Management-en-2026.webp',
  6189: '/wp-content/uploads/2026/03/Media-Buying-au-Maroc-Guide-pour-optimiser-votre-budget-publicitaire.webp',
  6184: '/wp-content/uploads/2026/03/Pourquoi-faire-appel-a-une-agence-de-communication.webp',
  6179: '/wp-content/uploads/2026/03/Personal-Branding-Le-Guide-Complet.webp',
  6172: '/wp-content/uploads/2026/03/Rebranding-Quand-et-Comment-Reussir-la-Refonte-de-votre-Marque.webp',
  6161: '/wp-content/uploads/2026/03/E-commerce-au-Maroc-en-2026-Le-Guide-Complet.webp',
  6152: '/wp-content/uploads/2026/02/Developpement-Digital-au-Maroc-La-Cle-de-Croissance.webp',
  6140: '/wp-content/uploads/2026/02/Creation-site-web-Maroc-Le-Guide.webp',
  5698: '/wp-content/uploads/2026/01/elaborer-strategie-de-contenu-efficace.webp',
  5636: '/wp-content/uploads/2026/01/comment-creer-sa-marque-7-strategies.webp',
  5641: '/wp-content/uploads/2026/01/phases-cycle-de-vie-produit.webp',
  5639: '/wp-content/uploads/2026/01/types-de-site-internet-maroc.webp',
  5638: '/wp-content/uploads/2026/01/5-techniques-de-vente.webp',
  5560: '/wp-content/uploads/2026/01/content-de-marketing-2026.webp',
  5548: '/wp-content/uploads/2026/01/prix-creation-site-web-maroc.webp',
  5540: '/wp-content/uploads/2026/01/booster-clics-google-ads-maroc.webp',
};

// Strip HTML tags from excerpt
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&#8230;/g, '…').replace(/&#8217;/g, "'").replace(/&#038;/g, '&').replace(/\s+/g, ' ').trim();
}

// ─── Articles from WP API ────────────────────────────────────────────────────
const wpArticles = [
  { id: 6476, date: '2026-04-11', slug: 'marketing-mix-les-4p-indispensables-pour-booster-votre-business-au-maroc', title: 'Marketing mix : les 4P indispensables pour booster votre business au Maroc', excerpt: 'Le marketing mix constitue le socle de toute stratégie commerciale efficace. En combinant les 4 P — Produit, Prix, Place et Promotion — les entrepreneurs marocains peuvent répondre aux attentes locales, se différencier et augmenter leurs ventes.', media: 6473, category: 'Marketing Digital', readTime: 8 },
  { id: 6448, date: '2026-04-10', slug: 'web-scraping-au-maroc-guide-complet-pour-debuter-efficacement', title: 'Web Scraping au Maroc : Guide complet pour débuter efficacement', excerpt: 'Le web scraping permet d\'extraire automatiquement des données depuis Internet. Au Maroc, développeurs, marketeurs et entrepreneurs s\'interrogent sur les aspects légaux, les outils adaptés et les bonnes pratiques.', media: 6445, category: 'Marketing Digital', readTime: 10 },
  { id: 6439, date: '2026-04-08', slug: 'comment-creer-un-slogan-percutant-guide-complet-pour-les-marques-marocaines', title: 'Comment créer un slogan percutant : guide complet pour les marques marocaines', excerpt: 'Dans un marché compétitif comme celui du Maroc, le slogan représente bien plus qu\'une simple phrase publicitaire. Il incarne l\'essence même de votre identité digitale et différencie votre marque.', media: 6436, category: 'Branding', readTime: 7 },
  { id: 6429, date: '2026-04-08', slug: 'le-guide-complet-du-affiliate-marketing-lancer-un-business-rentable-en-2026', title: 'Le Guide Complet du Affiliate Marketing : Lancer un Business Rentable en 2026', excerpt: 'L\'affiliate marketing est devenu l\'un des moyens les plus populaires pour générer des revenus passifs en ligne en 2026. Au Maroc, de nombreux entrepreneurs cherchent des modèles digitaux rentables.', media: 6431, category: 'Marketing Digital', readTime: 12 },
  { id: 6417, date: '2026-04-07', slug: 'intelligence-emotionnelle-un-atout-pour-gerer-les-crises-sur-le-web', title: 'Intelligence émotionnelle : un atout pour gérer les crises sur le web', excerpt: 'L\'intelligence émotionnelle est devenue une compétence essentielle pour les entreprises qui doivent gérer les crises sur le web avec rapidité, empathie et stratégie.', media: 6419, category: 'Marketing Digital', readTime: 6 },
  { id: 6412, date: '2026-04-06', slug: 'service-apres-vente-levier-marketing-puissant-au-maroc', title: 'Service après-vente : levier marketing puissant au Maroc', excerpt: 'Le service après-vente, l\'e-réputation et l\'expérience client sont aujourd\'hui des leviers incontournables pour les entreprises marocaines qui souhaitent fidéliser leurs clients.', media: 6413, category: 'Branding', readTime: 7 },
  { id: 6407, date: '2026-04-05', slug: 'e-reputation-et-service-apres-vente-proteger-son-image-de-marque', title: 'E-réputation et service après-vente : protéger son image de marque', excerpt: 'Aujourd\'hui, l\'e-réputation est devenue un levier stratégique pour toutes les entreprises marocaines souhaitant développer leur activité durablement.', media: 6408, category: 'Branding', readTime: 8 },
  { id: 6395, date: '2026-04-04', slug: 'le-guide-du-marketing-dinfluence-pour-les-marques-en-2026', title: 'Le Guide du Marketing d\'Influence pour les marques en 2026', excerpt: 'Le marketing d\'influence est devenu l\'un des leviers les plus puissants pour les entreprises souhaitant développer leur visibilité en ligne et accélérer leur croissance au Maroc.', media: 6396, category: 'Branding', readTime: 9 },
  { id: 6388, date: '2026-04-03', slug: 'la-segmentation-client-le-secret-des-campagnes-ultra-ciblees', title: 'La Segmentation Client : Le secret des campagnes ultra-ciblées', excerpt: 'La segmentation est devenue un pilier incontournable pour les entreprises qui souhaitent améliorer leur ciblage marketing, construire des personas précis et mieux organiser leurs groupes d\'audience.', media: 6390, category: 'Stratégie', readTime: 8 },
  { id: 6383, date: '2026-04-02', slug: 'landing-page-guide-cro-pour-convertir-plus-au-maroc', title: 'Landing Page : Guide CRO pour convertir plus au Maroc', excerpt: 'Une landing page performante permet de générer des leads qualifiés, d\'améliorer l\'optimisation du taux de conversion et de maximiser le ROI de vos campagnes publicitaires.', media: 6384, category: 'Création Web', readTime: 9 },
  { id: 6367, date: '2026-04-01', slug: 'comment-integrer-loutbound-dans-un-plan-marketing-global', title: 'Comment intégrer l\'outbound dans un Plan Marketing global', excerpt: 'Construire un plan marketing performant ne suffit plus à attirer naturellement des prospects. Les entreprises doivent mettre en place une stratégie d\'acquisition capable de générer des leads qualifiés rapidement.', media: 6368, category: 'Génération de Leads', readTime: 8 },
  { id: 6362, date: '2026-03-31', slug: 'prospection-commerciale-cold-emailing-vs-calling', title: 'Prospection Commerciale : Cold Emailing vs Calling', excerpt: 'La prospection commerciale est un enjeu majeur pour les entreprises qui souhaitent accélérer leur croissance au Maroc. Quelle méthode est la plus rentable pour générer des leads qualifiés ?', media: 6363, category: 'Génération de Leads', readTime: 7 },
  { id: 6357, date: '2026-03-30', slug: 'outbound-marketing-strategies-pour-prospecter-directement', title: 'Outbound Marketing : Stratégies pour Prospecter Directement', excerpt: 'L\'outbound marketing est devenu un levier incontournable pour les entreprises qui souhaitent accélérer leur acquisition client grâce à la prospection directe.', media: 6358, category: 'SEO', readTime: 8 },
  { id: 6352, date: '2026-03-29', slug: 'guide-de-lautomatisation-du-marketing-pour-les-pme', title: 'Guide de l\'Automatisation du Marketing pour les PME', excerpt: 'L\'automatisation du marketing est devenue une solution incontournable pour les entreprises souhaitant gagner du temps, améliorer leur productivité et optimiser leur acquisition client.', media: 6353, category: 'Marketing Digital', readTime: 10 },
  { id: 6324, date: '2026-03-28', slug: 'seo-le-guide-ultime-pour-dominer-les-resultats-de-google', title: 'SEO : Le Guide Ultime pour Dominer les Résultats de Google', excerpt: 'Le SEO, aussi appelé référencement naturel, est devenu un levier incontournable pour les entreprises marocaines qui souhaitent gagner en visibilité sur Google et attirer des clients qualifiés.', media: 6325, category: 'SEO', readTime: 15 },
  { id: 6347, date: '2026-03-27', slug: 'inbound-marketing-attirer-convertir-et-fideliser-ses-clients', title: 'Inbound Marketing : Attirer, Convertir et Fidéliser ses clients', excerpt: 'L\'inbound marketing est devenu une stratégie incontournable pour les entreprises marocaines souhaitant améliorer leur visibilité en ligne et générer de la génération de leads de manière durable.', media: 6348, category: 'Marketing Digital', readTime: 11 },
  { id: 6335, date: '2026-03-26', slug: 'top-7-plugins-wordpress-pour-booster-son-seo', title: 'Top 7 Plugins WordPress pour booster son SEO', excerpt: 'Les plugins WordPress sont devenus indispensables pour toute entreprise marocaine souhaitant améliorer sa visibilité sur Google. Votre site doit être rapide, sécurisé et parfaitement optimisé.', media: 6344, category: 'SEO', readTime: 8 },
  { id: 6315, date: '2026-03-25', slug: 'comment-reussir-son-etude-de-marche-avant-de-lancer-un-projet', title: 'Comment réussir son étude de marché avant de lancer un projet', excerpt: 'Avant de lancer une entreprise, un site e-commerce ou une nouvelle offre, réaliser une étude de marché est une étape essentielle pour éviter les erreurs coûteuses.', media: 6316, category: 'Stratégie', readTime: 9 },
  { id: 6329, date: '2026-03-24', slug: 'limportance-des-backlinks-dans-une-strategie-de-netlinking', title: 'L\'importance des Backlinks dans une stratégie de netlinking', excerpt: 'Les backlinks jouent aujourd\'hui un rôle central dans toute stratégie de netlinking performante. Ils constituent un véritable indicateur d\'autorité et de crédibilité aux yeux des moteurs de recherche.', media: 6330, category: 'SEO', readTime: 8 },
  { id: 6310, date: '2026-03-23', slug: 'guide-complet-de-la-strategie-marketing-digital-en-2026', title: 'Guide Complet de la Stratégie Marketing Digital en 2026', excerpt: 'La stratégie marketing digital est devenue un levier incontournable pour les entreprises marocaines qui souhaitent accélérer leur croissance et réussir leur transformation numérique.', media: 6311, category: 'Stratégie', readTime: 13 },
  { id: 6305, date: '2026-03-22', slug: 'comprendre-limpact-des-reseaux-sociaux-sur-votre-business-a-lere-du-digital', title: 'Comprendre l\'impact des réseaux sociaux sur votre business à l\'ère du digital', excerpt: 'Aujourd\'hui, l\'impact des réseaux sociaux, le media buying et le rôle d\'une agence de communication sont devenus des piliers essentiels de la croissance digitale des entreprises.', media: 6306, category: 'Réseaux Sociaux', readTime: 7 },
  { id: 6300, date: '2026-03-21', slug: 'marketing-des-reseaux-sociaux-notre-guide-ultime', title: 'Marketing des réseaux sociaux : notre guide ultime', excerpt: 'Le marketing des réseaux sociaux est devenu un levier incontournable pour les entreprises marocaines souhaitant gagner en visibilité et générer des leads.', media: 6301, category: 'Réseaux Sociaux', readTime: 10 },
  { id: 6292, date: '2026-03-20', slug: 'roi-branding-comment-le-mesurer-efficacement-guide-maroc-2026', title: 'ROI branding : comment le mesurer efficacement | Guide Maroc 2026', excerpt: 'Au Maroc, de nombreuses entreprises investissent dans leur image de marque sans savoir si leurs efforts génèrent un réel retour sur investissement. Découvrez comment mesurer l\'impact de votre branding.', media: 6293, category: 'Branding', readTime: 9 },
  { id: 6285, date: '2026-03-19', slug: 'comment-bien-choisir-une-palette-de-couleurs-dune-marque', title: 'Comment bien choisir une palette de couleurs d\'une marque ?', excerpt: 'La palette de couleurs joue un rôle central dans le branding d\'une entreprise et influence directement la perception de votre audience. Découvrez comment faire le bon choix.', media: 6287, category: 'Branding', readTime: 7 },
  { id: 6272, date: '2026-03-18', slug: 'les-7-erreurs-de-branding-a-ne-jamais-commettre', title: 'Les 7 erreurs de branding à ne jamais commettre', excerpt: 'Les erreurs de branding sont parmi les principales causes d\'échec des stratégies marketing des PME au Maroc. Évitez ces pièges pour construire une marque solide et crédible.', media: 6275, category: 'Branding', readTime: 8 },
  { id: 6264, date: '2026-03-17', slug: 'branding-au-maroc-comment-construire-une-marque-forte-en-ligne', title: 'Branding au Maroc : Comment Construire une Marque Forte en Ligne', excerpt: 'Au Maroc, le branding est devenu un levier incontournable pour toute entreprise souhaitant se démarquer dans un environnement digital de plus en plus concurrentiel.', media: 6265, category: 'Branding', readTime: 10 },
  { id: 6254, date: '2026-03-16', slug: 'cest-quoi-ai-marketing-guide-complet-pour-les-entreprises-au-maroc', title: 'C\'est quoi AI marketing ? Guide complet pour les entreprises au Maroc', excerpt: 'Aujourd\'hui, le digital marketing au Maroc connaît une évolution rapide. L\'intelligence artificielle est devenue un levier incontournable pour optimiser les campagnes et améliorer le ROI.', media: 6255, category: 'Marketing Digital', readTime: 11 },
  { id: 6259, date: '2026-03-15', slug: 'limpact-dun-logo-professionnel-sur-la-reussite-de-votre-entreprise', title: 'L\'impact d\'un logo professionnel sur la réussite de votre entreprise', excerpt: 'Au Maroc, de nombreuses entreprises sous-estiment encore l\'importance d\'un logo professionnel et d\'une identité visuelle cohérente. Pourtant, votre image de marque peut faire toute la différence.', media: 6260, category: 'Branding', readTime: 7 },
  { id: 6247, date: '2026-03-14', slug: 'le-guide-ultime-pour-vendre-en-ligne-au-maroc-de-a-a-z', title: 'Le Guide Ultime pour Vendre en Ligne au Maroc : de A à Z', excerpt: 'Vendre en ligne au Maroc représente une opportunité stratégique pour les entreprises. Avec l\'essor de l\'e-commerce, lancer une boutique en ligne devient un levier incontournable.', media: 6251, category: 'E-commerce', readTime: 13 },
  { id: 6240, date: '2026-03-13', slug: 'email-marketing-au-maroc-le-levier-oublie-pour-booster-vos-ventes-et-fideliser', title: 'Email Marketing au Maroc : Le Levier Oublié pour Booster vos Ventes', excerpt: 'Au Maroc, un levier reste largement sous-exploité : l\'email marketing. Mettre en place une stratégie email peut transformer votre acquisition et fidéliser durablement vos clients.', media: 6243, category: 'Marketing Digital', readTime: 9 },
  { id: 6231, date: '2026-03-12', slug: '5-strategies-efficaces-pour-la-generation-de-leads-b2b-au-maroc', title: '5 Stratégies Efficaces pour la Génération de Leads B2B au Maroc', excerpt: 'Dans un marché marocain de plus en plus digitalisé, la génération de leads B2B est devenue un enjeu stratégique majeur pour les entreprises.', media: 6238, category: 'Génération de Leads', readTime: 10 },
  { id: 6225, date: '2026-03-11', slug: 'comment-creer-une-strategie-de-contenu-qui-attire-des-clients-au-maroc', title: 'Comment créer une stratégie de contenu qui attire des clients au Maroc', excerpt: 'De nombreuses entreprises au Maroc publient régulièrement sur leur site ou réseaux sociaux sans obtenir de résultats concrets. Le problème ? L\'absence d\'une véritable stratégie de contenu.', media: 6229, category: 'Marketing Digital', readTime: 9 },
  { id: 6220, date: '2026-03-10', slug: 'photographe-professionnel-agadir-pourquoi-engager-un-expert-local-pour-votre-business', title: 'Photographe professionnel Agadir : Pourquoi engager un expert local ?', excerpt: 'Dans un environnement digital concurrentiel au Maroc, faire appel à un photographe professionnel à Agadir ne consiste plus simplement à réaliser de belles photos, mais à construire une identité visuelle.', media: 6223, category: 'Branding', readTime: 6 },
  { id: 6215, date: '2026-03-09', slug: 'les-types-de-communication-lequel-choisir-pour-votre-strategie-dentreprise', title: 'Les Types de Communication : Lequel Choisir pour votre Stratégie d\'Entreprise ?', excerpt: 'Au Maroc, de plus en plus d\'entreprises investissent dans leur visibilité. Pourtant, beaucoup échouent à obtenir des résultats concrets par manque de maîtrise des types de communication.', media: 6218, category: 'Génération de Leads', readTime: 8 },
  { id: 6197, date: '2026-03-08', slug: 'social-media-management-en-2026-le-guide-strategique-pour-booster-votre-presence-digitale', title: 'Social Media Management en 2026 : le guide stratégique', excerpt: 'En 2026, le social media management (SMM) n\'est plus une option pour les entreprises marocaines : c\'est un levier stratégique incontournable pour booster votre présence digitale.', media: 6201, category: 'Réseaux Sociaux', readTime: 10 },
  { id: 6186, date: '2026-03-07', slug: 'media-buying-au-maroc-guide-pour-optimiser-votre-budget-publicitaire-google-meta', title: 'Media Buying au Maroc : Guide pour optimiser votre budget Google & Meta', excerpt: 'Le media buying est devenu un levier incontournable pour les entreprises marocaines. Une grande partie des budgets publicitaires reste encore mal exploitée. Voici comment optimiser.', media: 6189, category: 'Publicité Digitale', readTime: 11 },
  { id: 6181, date: '2026-03-06', slug: 'pourquoi-faire-appel-a-une-agence-de-communication-pour-digitaliser-votre-business', title: 'Pourquoi faire appel à une agence de communication pour digitaliser votre business ?', excerpt: 'Aujourd\'hui, la digitalisation n\'est plus une option pour les entreprises marocaines. Vos clients sont déjà en ligne. Découvrez pourquoi une agence de communication fait toute la différence.', media: 6184, category: 'Génération de Leads', readTime: 7 },
  { id: 6176, date: '2026-03-05', slug: 'personal-branding-le-guide-complet-pour-propulser-votre-carriere-en-2026', title: 'Personal Branding : Le Guide Complet pour Propulser votre Carrière en 2026', excerpt: 'Avoir un bon produit ou un service ne suffit plus. Vous devez être visible, crédible et mémorable. C\'est ici que le personal branding devient un levier de croissance essentiel.', media: 6179, category: 'Branding', readTime: 9 },
  { id: 6167, date: '2026-03-04', slug: 'rebranding-quand-et-comment-reussir-la-refonte-de-votre-marque-au-maroc', title: 'Rebranding : Quand et Comment Réussir la Refonte de votre Marque au Maroc ?', excerpt: 'Le rebranding est devenu un levier stratégique incontournable sur un marché marocain de plus en plus concurrentiel. Les consommateurs sont sensibles à l\'image, à la cohérence du message.', media: 6172, category: 'Branding', readTime: 10 },
  { id: 6160, date: '2026-03-03', slug: 'e-commerce-au-maroc-en-2026-le-guide-complet-pour-lancer-votre-boutique', title: 'E-commerce au Maroc en 2026 : Le Guide Complet pour Lancer votre Boutique', excerpt: 'L\'e-commerce au Maroc connaît une croissance spectaculaire. Avec l\'augmentation du nombre d\'internautes et l\'explosion de l\'usage mobile, vendre en ligne n\'a jamais été aussi accessible.', media: 6161, category: 'E-commerce', readTime: 12 },
  { id: 6151, date: '2026-02-24', slug: 'developpement-digital-au-maroc-la-cle-de-croissance-pour-votre-pme', title: 'Développement Digital au Maroc : La Clé de Croissance pour votre PME', excerpt: 'Aujourd\'hui, le développement digital est devenu un levier incontournable pour les PME marocaines qui souhaitent attirer plus de clients et accélérer leur croissance.', media: 6152, category: 'Marketing Digital', readTime: 9 },
  { id: 6138, date: '2026-02-17', slug: 'creation-site-web-maroc-le-guide-pour-digitaliser-votre-business-en-2026', title: 'Création site web Maroc : Le Guide pour Digitaliser votre Business en 2026', excerpt: 'Pour les TPE, PME et entrepreneurs au Maroc, la création de site web s\'impose désormais comme un levier stratégique de développement incontournable.', media: 6140, category: 'Création Web', readTime: 12 },
  { id: 5659, date: '2026-02-10', slug: 'elaborer-strategie-de-contenu-efficace-au-maroc', title: 'Elaborer stratégie de contenu efficace au Maroc', excerpt: 'Une stratégie de contenu, c\'est un plan structuré pour créer des idées pertinentes. Elle aide les entreprises à trouver des clients. Au Maroc, le marketing change rapidement.', media: 5698, category: 'Marketing Digital', readTime: 6 },
  { id: 5628, date: '2026-02-06', slug: 'comment-creer-sa-marque-7-strategies-pour-2026', title: 'Comment créer sa marque : 7 stratégies pour 2026', excerpt: 'Créer sa marque au Maroc est une bonne idée pour 2026. Le pays offre de belles opportunités. Les entrepreneurs locaux veulent des produits originaux qui parlent de la culture marocaine.', media: 5636, category: 'Marketing Digital', readTime: 7 },
  { id: 5466, date: '2026-02-03', slug: 'quelles-sont-les-phases-du-cycle-de-vie-dun-produit', title: 'Quelles sont les phases du cycle de vie d\'un produit ?', excerpt: 'Les phases du cycle de vie d\'un produit constituent une histoire complète : de l\'idée à la fin de vie. Connaître ces phases permet de prendre de meilleures décisions marketing.', media: 5641, category: 'Marketing Digital', readTime: 6 },
  { id: 5571, date: '2026-01-30', slug: 'les-differents-types-de-site-internet-au-maroc', title: 'Les différents types de site internet au Maroc', excerpt: 'On trouve de nombreux types de site internet au Maroc. Ils soutiennent les entreprises dans leur croissance. Comprendre ces types vous aide à choisir le bon pour votre activité.', media: 5639, category: 'Création Web', readTime: 5 },
  { id: 5615, date: '2026-01-27', slug: '5-techniques-de-vente-que-tout-commercial-doit-connaitre', title: '5 techniques de vente que tout commercial doit connaître', excerpt: 'Dans la vente, le succès exige des stratégies. Cet article vous dévoile 5 techniques de vente faciles à appliquer qui convertissent vos prospects en clients fidèles.', media: 5638, category: 'Marketing Digital', readTime: 7 },
  { id: 5553, date: '2026-01-23', slug: 'content-de-marketing-tout-ce-quil-faut-savoir-en-2026', title: 'Content de Marketing : Tout ce qu\'il faut savoir en 2026', excerpt: 'Le contenu n\'est plus un "plus", c\'est le carburant de la visibilité en ligne. Les marques qui gagnent aujourd\'hui ne crient pas : elles racontent, éduquent et créent de la valeur.', media: 5560, category: 'Marketing Digital', readTime: 9 },
  { id: 5547, date: '2026-01-20', slug: 'combien-le-prix-de-creation-dun-site-web-au-maroc', title: 'Combien le prix de création d\'un site web au Maroc ?', excerpt: 'Aujourd\'hui, être présent sur le web n\'est plus un luxe, c\'est une nécessité. Mais une question demeure : combien ça coûte au Maroc ? Toutes les réponses dans ce guide complet.', media: 5548, category: 'Création Web', readTime: 8 },
  { id: 5535, date: '2026-01-16', slug: 'comment-booster-vos-clics-google-ads-pour-le-marche-marocain', title: 'Comment booster vos clics Google Ads pour le marché marocain?', excerpt: 'Au Maroc, le digital n\'est plus un choix, c\'est un réflexe. Le CTR devient un indicateur essentiel pour évaluer la performance d\'une campagne Google Ads. Découvrez comment l\'améliorer.', media: 5540, category: 'Publicité Digitale', readTime: 8 },
];

async function main() {
  console.log('🚀 Starting blog seed...');

  // 1. Ensure admin user exists
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    const bcrypt = require('bcryptjs');
    admin = await prisma.user.create({
      data: {
        email: 'admin@rankuplus.com',
        password: await bcrypt.hash('admin123', 12),
        name: 'Admin RankUp',
        role: 'ADMIN',
      },
    });
    console.log('✅ Created admin user');
  }

  // 2. Create categories
  const categoryNames = [...new Set(wpArticles.map(a => a.category))];
  const categoryMap = {};
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cat = await prisma.blogCategory.upsert({
      where: { slug },
      update: {},
      create: { slug, nameFr: name, nameEn: name, nameAr: name },
    });
    categoryMap[name] = cat.id;
    console.log(`  📂 Category: ${name}`);
  }

  // 3. Create blog posts
  let created = 0;
  let skipped = 0;
  for (const art of wpArticles) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: art.slug } });
    if (existing) { skipped++; continue; }

    const imageUrl = imageMap[art.media] || null;
    await prisma.blogPost.create({
      data: {
        slug: art.slug,
        titleFr: art.title,
        titleEn: art.title,
        titleAr: art.title,
        excerptFr: art.excerpt,
        excerptEn: art.excerpt,
        excerptAr: art.excerpt,
        featuredImage: imageUrl,
        imageAlt: art.title,
        status: 'PUBLISHED',
        readTime: art.readTime,
        isFeatured: created < 3,
        publishedAt: new Date(art.date),
        categoryId: categoryMap[art.category],
        authorId: admin.id,
        metaTitleFr: art.title + ' | RankUp',
        metaTitleEn: art.title + ' | RankUp',
        metaDescFr: art.excerpt.slice(0, 160),
        metaDescEn: art.excerpt.slice(0, 160),
        tags: art.category + ',marketing,maroc,rankup',
      },
    });
    created++;
    console.log(`  ✅ [${created}] ${art.title.slice(0, 60)}...`);
  }

  console.log(`\n🎉 Done! Created: ${created} posts, Skipped (already exist): ${skipped}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

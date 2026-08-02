# Règles du Moteur A — vérification du 1er août 2026 (jalon F1)

> **Vérification faite par le fondateur**, contre le texte en vigueur
> (22 NYCRR partie 520) et le handbook du NYS BOLE — les textes eux-mêmes, pas
> des résumés. Ce document est le compte rendu de cette vérification et de ce
> qu'elle a changé dans le code.
>
> **Résultat** : R-NY-001 activée · R-NY-002 d'abord maintenue inactive, puis
> **activée sous une autre forme** après la recherche du 2026-08-02 (elle ne
> produit plus de voie, seulement un bloc de texte) · R-ALT-001 laissée à
> l'arbitrage métier.

## Le point qui commande les trois réponses

Un candidat ne peut régulariser **que** la déficience de durée **ou** celle de
substance, jamais les deux (§ 520.6). La France étant civiliste, le LL.M. est
intégralement consommé par la régularisation substantielle : la durée — 83
crédits juridiques, dont 64 présentiels — doit donc être atteinte par le **seul
diplôme français**.

Tout le reste en découle, y compris la conclusion contre-intuitive sur M1.

## R-NY-001 — voie du LL.M. : **activée**

Source `https://www.nycourts.gov/ctapps/520rules10.htm`, vérifiée le
`2026-08-01`. La voie existe, le NY BOLE est bien l'autorité, l'appréciation est
individuelle : le texte affiché est exact.

**M1 reste dans la condition**, à l'inverse de ce que suggérait l'analyse du
code. Le § 520.6(b)(1) demande la preuve de l'accomplissement des conditions de
formation pour l'accès à la profession dans le pays d'origine — en France, c'est
le M1 qui ouvre le CRFPA, pas la licence. Le retirer aurait exclu précisément le
diplôme visé.

**CRFPA est redondant sans être faux** : le M1 en étant le prérequis, ces
profils déclenchent déjà la règle par la première valeur de la liste.

**Le vrai risque était ailleurs, et il est traité** : aucune condition ne teste
la durée, alors qu'un profil qui n'atteint pas 83/64 crédits ne peut être
régularisé par aucune voie et recevrait quand même le texte. Le questionnaire ne
recueille pas ce décompte, et les douze écrans du CDC §12.4 ne s'étendent pas
sans décision produit. Le contrôle a donc été placé dans la **revue avant
envoi** : point `durational-requirement`, **bloquant**, déclenché dès que
R-NY-001 a produit la voie. Aucun rapport ne part sans qu'un humain ait confirmé
le décompte.

> Le filet humain n'a pas disparu, il a changé de place — du moteur vers la
> relecture, là où le CDC §17 le prévoit.

## R-NY-002, première vérification (2026-08-01) — **inactive**

La vérification a conclu **contre** la règle, ce qui est un résultat et non un
report. Trois corrections ont été apportées, et elle reste `active: false`.

1. **FRANCE est sortie de la condition.** Le § 520.6(b)(2), seul texte visant
   les avocats déjà admis, est réservé aux pays « whose jurisprudence is based
   upon principles of English Common Law ». La France en est exclue, et le
   § 520.10(a)(1)(ii) pose la même limite pour l'admission sans examen.
2. **« Voie directe » était inexact même pour les profils légitimes** : le
   § 520.6(b)(2) exige un LL.M. **en plus** de l'admission étrangère. Le bloc
   `TB-DIRECT-PATH` a été réécrit — il ne promet plus d'examen de voie directe
   et dit que l'admission étrangère ne dispense par elle-même d'aucune
   condition.
3. **La priorité était inversée.** `NY_VIA_LLM_SUBJECT_TO_BOLE` passe désormais
   devant `DIRECT_PATH_TO_EXAMINE` dans `PATH_PRIORITY`. L'ordre précédent
   disait le contraire du texte : un avocat français recevait la voie directe et
   jamais la voie LL.M.

**Ce qui restait à trancher** : `OTHER_COUNTRY` ne dit pas de quel pays il
s'agit. Un avocat allemand ou espagnol relève d'un système civiliste au même
titre qu'un avocat français — la condition de common law n'est donc pas
davantage établie pour lui. Sortir la France était nécessaire, ce n'était pas
suffisant. Recherche conduite le 2026-08-02, voir ci-dessous.

## R-NY-002, seconde vérification (2026-08-02) — **activée sous une autre forme**

Source `https://www.nybarexam.org/foreign/foreignlegaleducation.htm`, croisée
avec le texte de la partie 520. La recherche a défait une partie de la première
vérification, ce qu'il faut dire tel quel.

### Trois constats

1. **Le BOLE ne publie aucune liste** des juridictions dont la jurisprudence est
   fondée sur les principes de la common law anglaise, ni méthode publique de
   classement. Il impose une évaluation individuelle du dossier (*Request for
   Foreign Evaluation*). Une règle qui trierait par pays inventerait donc son
   critère — ce qui explique après coup pourquoi elle n'a jamais pu être
   activée en l'état.
2. **Aucune des deux voies ne se passe d'un passage aux États-Unis.** Le
   § 520.6(b)(2) exige un LL.M. américain ; le § 520.10(a)(3) exige un premier
   diplôme obtenu dans une law school américaine agréée par l'ABA, qu'un LL.M.
   ne remplace pas. `DIRECT_PATH_TO_EXAMINE` ne décrit donc rien de réel.
3. **« La France est exclue de la Rule 520.6 » était trop large.** Le
   § 520.6(b)(1)(ii) permet de corriger une déficience substantielle par un
   LL.M. conforme, dès lors que la durée est satisfaite. C'est exactement ce que
   dit `NY_VIA_LLM_SUBJECT_TO_BOLE` : le produit disait juste par ailleurs, et
   seule la formulation du commentaire de code était excessive.

### Ce que la règle est devenue

Elle **ne produit plus de voie propre**. Elle produit la même voie que R-NY-001
et n'ajoute qu'un bloc de texte, `TB-FOREIGN-BAR` — l'assemblage rend tous les
blocs des règles dont le fait vaut la voie retenue. L'admission étrangère cesse
d'être une orientation et redevient ce qu'elle est : un élément du dossier.

La condition vise **la France comme les autres pays**
(`in ["FRANCE", "OTHER_COUNTRY"]`), et non `neq "NONE"` : `foreignBar` reste
`undefined` quand la logique conditionnelle saute l'écran, et un `neq` aurait
fait feu pour tout le monde.

### Ce que le produit n'a pas le droit de dire

- « Vous êtes admis dans le pays X, donc vous pouvez passer l'examen sans
  LL.M. » — le § 520.6(b)(2) exige le LL.M.
- « Vous êtes admis dans un pays de common law, donc vous pouvez être admis sans
  examen. » — omet le premier diplôme américain, la réciprocité, les cinq années
  de pratique et le pouvoir discrétionnaire de l'Appellate Division.

### Ce qui reste ouvert

`DIRECT_PATH_TO_EXAMINE` reste dans la liste fermée du CDC §14.1, vide de
contenu. La vider est un constat ; la retirer serait modifier le cahier des
charges. Y remettre une règle demanderait une source décrivant une voie qui se
passe d'un passage aux États-Unis — aucune n'a été trouvée.

## R-ALT-001 — alternatives : arbitrage métier

Rien à vérifier : sa source reste `interne:profil`, elle n'énonce aucun droit
américain. Ce qu'elle affirme est un jugement stratégique — qu'un projet de
retour oriente ailleurs qu'un barreau américain — alors que beaucoup de juristes
passent le barreau de New York puis rentrent.

Elle est de toute façon **masquée par R-NY-001** : `ALTERNATIVE_TO_EXAMINE` est
la voie la moins prioritaire et R-NY-001 vise les mêmes profils. L'activer
aujourd'hui n'afficherait jamais son texte.

## État mesuré après corrections

Balayage de 1 080 profils complets (produit cartésien : niveau d'études × type
de parcours × barreau étranger × objectif géographique × objectif de carrière).
Ces nombres décrivent la **structure des conditions**, pas le trafic réel.

| Configuration                    | Voies produites                                          |
| -------------------------------- | -------------------------------------------------------- |
| **État livré** (R-NY-001 active) | voie LL.M. : 900 · études insuffisantes : 180             |
| si R-NY-002 était activée        | inchangé — voie directe : **0**                           |
| si R-ALT-001 était activée       | inchangé — alternative : **0**                            |

**Conséquence à connaître, et à trancher** : depuis la correction de la
priorité, `DIRECT_PATH_TO_EXAMINE` est **structurellement inatteignable**. Tout
profil pouvant déclencher R-NY-002 déclenche aussi R-NY-001 (ou R-STRUCT-002),
qui priment. Même activée et corrigée, R-NY-002 n'afficherait jamais son texte.

C'est cohérent avec le droit — la voie de l'avocat étranger est un cas
particulier de la voie LL.M., pas une dispense — mais cela signifie que la
nuance « vous êtes déjà admis à un barreau » disparaît du rapport, puisque
`runEngineA` ne collecte les blocs de texte que de la voie retenue. Si cette
nuance doit apparaître, elle relève d'un **bloc complémentaire** et non d'une
voie concurrente. Décision à prendre ; rien n'a été fait dans un sens ou dans
l'autre.

## Enregistrer une révision au back-office

Aucun développement n'est nécessaire pour activer ou désactiver une règle.
Depuis `/admin/matrices`, chaque règle porte trois champs : source, date de
vérification, activation. Le même garde-fou qu'au commit s'applique à
l'enregistrement — une règle active sans source ni date est refusée
(`decideRuleRevision`, et `npm run check:rules`). Format de date attendu :
`AAAA-MM-JJ` strict.

Les révisions sont **append-only** : un rapport déjà produit continue de citer
la version de règle qui l'a produit (`rulesSnapshot`).

En revanche, une **condition** se modifie en code (`lib/engine-a/rules.seed.ts`)
et non au back-office : une logique de règle se teste. `lib/engine-a/run.test.ts`
et le balayage de `lib/assessment/exhaustive.test.ts` couvrent l'effet du
changement sur l'ensemble des profils.

## Sources consultées

- [22 NYCRR partie 520 — Rules of the Court of Appeals for the Admission of Attorneys](https://www.nycourts.gov/ctapps/520rules10.htm)
- [NYS BOLE — Foreign Legal Education](https://www.nybarexam.org/Foreign/ForeignLegalEducation.htm)
- [NYS BOLE — Foreign Legal Education Handbook, rév. 30 octobre 2025](https://www.nybarexam.org/Foreign/NY%20Bar%20Exam%20Foreign%20Legal%20Education%20Handbook_10.30.2025.pdf)
- [LII — 22 NYCRR § 520.6](https://www.law.cornell.edu/regulations/new-york/22-NYCRR-520.6)
- [Duke Law — New York Bar FAQ, janvier 2024](https://law.duke.edu/sites/default/files/international/Duke_Law_NY_Bar_FAQs_for_January_2024.pdf)
- [NYU School of Law — New York Bar Exam Eligibility](https://www.law.nyu.edu/graduateaffairs/handbook/new-york-bar-eligibility)

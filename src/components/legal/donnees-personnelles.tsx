"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { AnalyticsOptOut } from '@/components/legal/analytics-opt-out';

export default function DonneesPersonnelles() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4 flex items-center gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Politique de confidentialité</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="space-y-6">
        <AnalyticsOptOut />

        <Card>
          <CardHeader>
            <CardTitle>Responsable du traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Nom :</strong> asciitree.fr<br />
              <strong>Email :</strong> contact@asciitree.fr<br />
              <strong>Adresse :</strong> Cergy, France
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données collectées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Données techniques</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">Adresse IP</Badge>
                <Badge variant="secondary">User Agent</Badge>
                <Badge variant="secondary">Cookies</Badge>
                <Badge variant="secondary">Données de navigation</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Ces données sont collectées automatiquement lors de votre visite sur le site.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Données de contenu</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">Arbres ASCII générés</Badge>
                <Badge variant="secondary">Préférences utilisateur</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Ces données sont stockées localement dans votre navigateur et ne sont pas transmises à nos serveurs.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Finalités du traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Fournir le service de génération d&apos;arbres ASCII</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Améliorer l&apos;expérience utilisateur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Analyser l&apos;utilisation du site (anonymisé)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Assurer la sécurité du site</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base légale</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Le traitement de vos données est fondé sur l&apos;intérêt légitime d&apos;asciitree.fr
              à fournir et améliorer ses services, ainsi que sur votre consentement 
              pour les cookies non essentiels.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Durée de conservation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Données de navigation :</strong> 13 mois maximum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Cookies analytiques :</strong> 25 mois maximum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Données de contenu :</strong> Stockées localement, supprimées à votre demande</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destinataires des données</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Vos données ne sont pas vendues, louées ou partagées avec des tiers commerciaux. 
              Elles peuvent être transmises à nos prestataires techniques (hébergeur, analytics) 
              dans le strict cadre de la fourniture du service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vos droits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Droit d&apos;accès :</strong> Connaître les données vous concernant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Droit de rectification :</strong> Corriger des données inexactes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Droit d&apos;effacement :</strong> Supprimer vos données</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Droit d&apos;opposition :</strong> Vous opposer au traitement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Droit à la portabilité :</strong> Récupérer vos données</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Pour exercer vos droits ou pour toute question concernant le traitement de vos données, 
              contactez-nous à : <a href="mailto:contact@asciitree.fr" className="text-primary hover:underline">contact@asciitree.fr</a>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vous avez également le droit de déposer une plainte auprès de la CNIL si vous estimez 
              que vos droits ne sont pas respectés.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
